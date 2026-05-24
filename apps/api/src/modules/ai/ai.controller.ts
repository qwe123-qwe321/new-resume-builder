import { Controller, Post, Get, Body, Param, Req, UseGuards, HttpException, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('api/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(@Inject(AiService) private aiService: AiService) {}

  @Post('generate')
  async generate(@Req() req: Request, @Body() body: any) {
    try {
      return await this.aiService.generate(body.resumeId, (req as any).userId, body);
    } catch (err: any) {
      if (err.message === 'Resume not found') throw new HttpException(err.message, 404);
      throw new HttpException(err.message || 'AI generation failed', 500);
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
}
