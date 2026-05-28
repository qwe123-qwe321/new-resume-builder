import { Controller, Post, Get, Body, Param, Req, UseGuards, HttpException, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { AiService } from './ai.service';
import { AiQueueService } from './ai-queue.service';

@Controller('api/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    @Inject(AiService) private aiService: AiService,
    @Inject(AiQueueService) private aiQueueService: AiQueueService,
  ) {}

  @Post('generate')
  async generate(@Req() req: Request, @Body() body: any) {
    try {
      return await this.aiService.generate(body.resumeId, (req as any).userId, body);
    } catch (err: any) {
      if (err.message === 'Resume not found') throw new HttpException(err.message, 404);
      if (err.message === 'RATE_LIMITED') throw new HttpException('请求过于频繁，请稍后重试', 429);
      throw new HttpException(err.message || 'AI generation failed', 500);
    }
  }

  @Post('generate/async')
  async generateAsync(@Req() req: Request, @Body() body: any) {
    try {
      const userId = (req as any).userId;
      const { sessionId } = await this.aiService.createQueuedSession(body.resumeId, userId, body);
      if (this.aiQueueService.isEnabled()) {
        await this.aiQueueService.enqueue({
          sessionId,
          resumeId: body.resumeId,
          userId,
          body,
        });
      } else {
        void this.aiService.runQueuedSession(sessionId, body.resumeId, userId, body);
      }
      return { data: { jobId: sessionId } };
    } catch (err: any) {
      if (err.message === 'Resume not found') throw new HttpException(err.message, 404);
      throw new HttpException(err.message || 'Async generation failed', 500);
    }
  }

  @Get('jobs/:jobId')
  async job(@Req() req: Request, @Param('jobId') jobId: string) {
    try {
      const data = await this.aiService.getJob(jobId, (req as any).userId);
      return { data };
    } catch (err: any) {
      if (err.message === 'Job not found') throw new HttpException(err.message, 404);
      throw new HttpException('Failed to get job', 500);
    }
  }

  @Get('sessions/:resumeId')
  async sessions(@Req() req: Request, @Param('resumeId') resumeId: string) {
    try {
      const data = await this.aiService.getSessions(resumeId, (req as any).userId);
      return { data };
    } catch (err: any) {
      if (err.message === 'Resume not found') throw new HttpException(err.message, 404);
      throw new HttpException('Failed to get sessions', 500);
    }
  }

  @Post('feedback')
  async feedback(@Req() req: Request, @Body() body: any) {
    const data = await this.aiService.saveFeedback((req as any).userId, body);
    return { data };
  }

  @Get('ops/stats')
  async opsStats() {
    const data = await this.aiService.getOpsStats();
    return { data };
  }
}
