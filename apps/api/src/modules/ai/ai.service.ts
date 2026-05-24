import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
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

@Injectable()
export class AiService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async generate(resumeId: string, userId: string, body: {
    action: string;
    experienceIndex?: number;
    targetJobDescription?: string;
    targetLanguage?: string;
  }) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!resume || resume.userId !== userId) throw new Error('Resume not found');

    const normalized = normalizeFields(resume as unknown as Record<string, unknown>);

    const config = getAIConfig();
    const startTime = Date.now();

    const session = await this.prisma.aISession.create({
      data: {
        resumeId,
        action: body.action,
        provider: config.provider,
        model: config.model,
        input: body,
      },
    });

    let result: unknown;
    let error: string | null = null;

    try {
      switch (body.action) {
        case 'generate_summary':
          result = await generateSummary(normalized as any);
          break;
        case 'optimize_experience':
          result = await optimizeExperience(normalized as any, body.experienceIndex ?? 0);
          break;
        case 'analyze_ats':
          result = await analyzeATS(normalized as any, body.targetJobDescription || '');
          break;
        case 'generate_interview_questions':
          result = await generateInterviewQuestions(normalized as any);
          break;
        case 'translate':
          result = await translateResume(normalized as any, body.targetLanguage || 'zh');
          break;
        case 'suggest_improvements':
          result = await suggestImprovements(normalized as any);
          break;
        default:
          throw new Error(`Unknown AI action: ${body.action}`);
      }
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
      },
    });

    if (error) throw new Error(error);

    return { sessionId: session.id, result, duration };
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
}
