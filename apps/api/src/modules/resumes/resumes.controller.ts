import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, HttpException, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ResumesService } from './resumes.service';

@Controller('api/resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(@Inject(ResumesService) private resumesService: ResumesService) {}

  @Get()
  async list(@Req() req: Request) {
    const data = await this.resumesService.findAll((req as any).userId);
    return { data };
  }

  @Post()
  async create(@Req() req: Request, @Body() body: any) {
    const userId = (req as any).userId;
    const resume = await this.resumesService.create(userId, body);
    return { data: resume };
  }

  @Get(':id')
  async get(@Req() req: Request, @Param('id') id: string) {
    const resume = await this.resumesService.findOne(id, (req as any).userId);
    if (!resume || resume.userId !== (req as any).userId) {
      throw new HttpException('Resume not found', 404);
    }
    return { data: resume };
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const userId = (req as any).userId;
    const existing = await this.resumesService.findOne(id, userId);
    if (!existing || existing.userId !== userId) {
      throw new HttpException('Resume not found', 404);
    }
    const data = await this.resumesService.update(id, userId, body);
    return { data };
  }

  @Delete(':id')
  async archive(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).userId;
    const existing = await this.resumesService.findOne(id, userId);
    if (!existing || existing.userId !== userId) {
      throw new HttpException('Resume not found', 404);
    }
    await this.resumesService.archive(id);
    return { data: { success: true } };
  }

  @Get(':id/versions')
  async versions(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).userId;
    const resume = await this.resumesService.findOne(id, userId);
    if (!resume || resume.userId !== userId) {
      throw new HttpException('Resume not found', 404);
    }
    const data = await this.resumesService.getVersions(id, userId);
    return { data };
  }

  @Post(':id/versions/:version/restore')
  async restore(@Req() req: Request, @Param('id') id: string, @Param('version') version: string) {
    const userId = (req as any).userId;
    const resume = await this.resumesService.findOne(id, userId);
    if (!resume || resume.userId !== userId) {
      throw new HttpException('Resume not found', 404);
    }
    try {
      const data = await this.resumesService.restoreVersion(id, parseInt(version), userId);
      return { data };
    } catch (err: any) {
      if (err.message === 'Version not found') throw new HttpException(err.message, 404);
      throw new HttpException('Failed to restore version', 500);
    }
  }
}
