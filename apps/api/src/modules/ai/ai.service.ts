import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AiQueueService } from './ai-queue.service';
import { getAIConfig } from './llm-client';
import {
  generateSummary,
  optimizeExperience,
  translateResume,
  analyzeATS,
  suggestImprovements,
  generateInterviewQuestions,
} from './agents';

function normalizeFields<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data } as Record<string, unknown>;
  if ('experiences' in result) {
    result.experience = result.experiences;
    delete result.experiences;
  }
  if ('educations' in result) {
    result.education = result.educations;
    delete result.educations;
  }
  return result as T;
}

type GenerateBody = {
  action: string;
  experienceIndex?: number;
  targetJobDescription?: string;
  targetLanguage?: string;
};

@Injectable()
export class AiService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(forwardRef(() => AiQueueService)) private aiQueueService: AiQueueService,
  ) {}

  private withJobStatus(body: GenerateBody, status: 'queued' | 'running' | 'done' | 'failed') {
    return { ...(body as Record<string, unknown>), _jobStatus: status };
  }

  private async runAction(normalized: Record<string, unknown>, body: GenerateBody) {
    switch (body.action) {
      case 'generate_summary':
        return generateSummary(normalized as any);
      case 'optimize_experience':
        return optimizeExperience(normalized as any, body.experienceIndex ?? 0);
      case 'analyze_ats':
        return analyzeATS(normalized as any, body.targetJobDescription || '');
      case 'generate_interview_questions':
        return generateInterviewQuestions(normalized as any);
      case 'translate':
        return translateResume(normalized as any, body.targetLanguage || 'zh');
      case 'suggest_improvements':
        return suggestImprovements(normalized as any);
      default:
        throw new Error(`Unknown AI action: ${body.action}`);
    }
  }

  private async loadResumeForUser(resumeId: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!resume || resume.userId !== userId) throw new Error('Resume not found');
    return normalizeFields(resume as unknown as Record<string, unknown>);
  }

  async generate(resumeId: string, userId: string, body: GenerateBody) {
    const normalized = await this.loadResumeForUser(resumeId, userId);
    const config = getAIConfig();
    const startTime = Date.now();

    const session = await this.prisma.aISession.create({
      data: {
        resumeId,
        action: body.action,
        provider: config.provider,
        model: config.model,
        input: this.withJobStatus(body, 'running'),
      },
    });

    let result: unknown;
    let error: string | null = null;
    try {
      result = await this.runAction(normalized, body);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown AI error';
    }

    const duration = Date.now() - startTime;
    await this.prisma.aISession.update({
      where: { id: session.id },
      data: {
        output: result as object,
        duration,
        error,
        tokensUsed: JSON.stringify(result || '').length / 4,
        input: this.withJobStatus(body, error ? 'failed' : 'done'),
      },
    });

    if (error) throw new Error(error);
    return { sessionId: session.id, result, duration };
  }

  async createQueuedSession(resumeId: string, userId: string, body: GenerateBody) {
    await this.loadResumeForUser(resumeId, userId);
    const config = getAIConfig();
    const session = await this.prisma.aISession.create({
      data: {
        resumeId,
        action: body.action,
        provider: config.provider,
        model: config.model,
        input: this.withJobStatus(body, 'queued'),
      },
    });
    return { sessionId: session.id };
  }

  async runQueuedSession(sessionId: string, resumeId: string, userId: string, body: GenerateBody) {
    await this.prisma.aISession.update({
      where: { id: sessionId },
      data: { input: this.withJobStatus(body, 'running') },
    });

    const startTime = Date.now();
    let result: unknown;
    let error: string | null = null;
    try {
      const normalized = await this.loadResumeForUser(resumeId, userId);
      result = await this.runAction(normalized, body);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown AI error';
    }

    const duration = Date.now() - startTime;
    await this.prisma.aISession.update({
      where: { id: sessionId },
      data: {
        output: result as object,
        duration,
        error,
        tokensUsed: JSON.stringify(result || '').length / 4,
        input: this.withJobStatus(body, error ? 'failed' : 'done'),
      },
    });
  }

  async getJob(jobId: string, userId: string) {
    const session = await this.prisma.aISession.findUnique({
      where: { id: jobId },
      include: { resume: { select: { userId: true } } },
    });
    if (!session || session.resume.userId !== userId) throw new Error('Job not found');

    const statusFromInput = (session.input as Record<string, unknown> | null)?._jobStatus;
    const status = (statusFromInput === 'queued' || statusFromInput === 'running' || statusFromInput === 'done' || statusFromInput === 'failed')
      ? statusFromInput
      : session.error
        ? 'failed'
        : session.output
          ? 'done'
          : 'queued';

    return {
      jobId: session.id,
      status,
      action: session.action,
      duration: session.duration,
      error: session.error,
      result: session.output || null,
      createdAt: session.createdAt,
    };
  }

  async getSessions(resumeId: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.userId !== userId) throw new Error('Resume not found');
    return this.prisma.aISession.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, action: true, provider: true, model: true, duration: true, tokensUsed: true, error: true, createdAt: true },
    });
  }

  async saveFeedback(userId: string, data: any) {
    return this.prisma.aIFeedback.create({ data: { userId, ...data } });
  }

  async getOpsStats() {
    const totalSessions = await this.prisma.aISession.count();
    const successSessions = await this.prisma.aISession.count({ where: { error: null } });
    const failedSessions = await this.prisma.aISession.count({ where: { NOT: { error: null } } });
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await this.prisma.aISession.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { duration: true, tokensUsed: true },
    });
    const avgLatency7d = recent.length > 0
      ? recent.reduce((sum: number, item: { duration: number | null }) => sum + (item.duration || 0), 0) / recent.length
      : 0;
    const estimatedCost = recent.reduce((sum: number, item: { tokensUsed: number | null }) => sum + ((item.tokensUsed || 0) / 1000) * 0.002, 0);

    const grouped = await this.prisma.aISession.groupBy({
      by: ['action'],
      _count: { action: true },
    });
    const actionDistribution = grouped.map((g: (typeof grouped)[number]) => ({ action: g.action, count: g._count.action }));

    const groupedFailed = await this.prisma.aISession.groupBy({
      by: ['action'],
      where: { NOT: { error: null } },
      _count: { action: true },
    });
    const actionFailedDistribution = groupedFailed.map((g: (typeof groupedFailed)[number]) => ({ action: g.action, count: g._count.action }));

    const recentFailed = await this.prisma.aISession.findMany({
      where: { NOT: { error: null } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { error: true },
    });
    const errorCounter = new Map<string, number>();
    for (const item of recentFailed) {
      const key = (item.error || '未知错误').slice(0, 120);
      errorCounter.set(key, (errorCounter.get(key) || 0) + 1);
    }
    const topErrors = [...errorCounter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([error, count]) => ({ error, count }));

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const throughput1h = await this.prisma.aISession.count({
      where: {
        createdAt: { gte: oneHourAgo },
        duration: { gt: 0 },
      },
    });
    const queueStats = await this.aiQueueService.getQueueStats();

    return {
      totalSessions,
      successRate: totalSessions > 0 ? successSessions / totalSessions : 0,
      failedSessions,
      avgLatency7d,
      estimatedCost,
      actionDistribution,
      actionFailedDistribution,
      topErrors,
      queueWaiting: queueStats.waiting,
      queueActive: queueStats.active,
      throughput1h,
    };
  }
}
