import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

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
export class ResumesService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId, isArchived: false },
      include: { _count: { select: { versions: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const data = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return data ? normalizeFields(data) : null;
  }

  async create(userId: string, data: any) {
    const resume = await this.prisma.resume.create({ data: { ...data, userId } });
    await this.prisma.resumeVersion.create({
      data: { resumeId: resume.id, version: 1, snapshot: resume as any, createdBy: 'initial' },
    });
    return resume;
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.resume.update({
        where: { id },
        data,
        include: {
          experiences: { orderBy: { sortOrder: 'asc' } },
          educations: { orderBy: { sortOrder: 'asc' } },
          skills: { orderBy: { sortOrder: 'asc' } },
        },
      });

      const latest = await tx.resumeVersion.findFirst({
        where: { resumeId: id },
        orderBy: { version: 'desc' },
      });

      await tx.resumeVersion.create({
        data: {
          resumeId: id,
          version: (latest?.version || 0) + 1,
          snapshot: updated as any,
          createdBy: 'manual',
        },
      });

      return normalizeFields(updated);
    });
  }

  async archive(id: string) {
    await this.prisma.resume.update({ where: { id }, data: { isArchived: true } });
  }

  getVersions(id: string, userId: string) {
    return this.prisma.resumeVersion.findMany({
      where: { resumeId: id },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, changelog: true, createdBy: true, createdAt: true },
    });
  }

  async restoreVersion(id: string, version: number, userId: string) {
    const v = await this.prisma.resumeVersion.findUnique({
      where: { resumeId_version: { resumeId: id, version } },
    });
    if (!v) throw new Error('Version not found');

    const snapshot = v.snapshot as Record<string, unknown>;
    const { experiences, educations, skills, certifications, languages, createdAt, updatedAt, ...fields } = snapshot;

    return this.prisma.$transaction(async (tx) => {
      const restored = await tx.resume.update({
        where: { id },
        data: fields as any,
        include: {
          experiences: { orderBy: { sortOrder: 'asc' } },
          educations: { orderBy: { sortOrder: 'asc' } },
          skills: { orderBy: { sortOrder: 'asc' } },
        },
      });

      const latest = await tx.resumeVersion.findFirst({
        where: { resumeId: id },
        orderBy: { version: 'desc' },
      });
      await tx.resumeVersion.create({
        data: {
          resumeId: id,
          version: (latest?.version || 0) + 1,
          snapshot: restored as any,
          createdBy: 'restore',
        },
      });

      return normalizeFields(restored);
    });
  }
}
