import { Injectable, Inject } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

const RESUME_SCALAR_FIELDS = new Set([
  'title',
  'targetJobTitle',
  'targetIndustry',
  'targetCompany',
  'language',
  'templateId',
  'themeColor',
  'firstName',
  'lastName',
  'jobTitle',
  'address',
  'phone',
  'email',
  'linkedIn',
  'github',
  'portfolio',
  'photoUrl',
  'workYears',
  'summary',
  'atsScore',
  'atsFeedback',
  'certifications',
  'languages',
]);

function pickResumeScalarData(input: Record<string, unknown>) {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (RESUME_SCALAR_FIELDS.has(key)) next[key] = value;
  }
  return next;
}

function normalizeRating(value: unknown): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 3;
  return Math.max(1, Math.min(5, Math.round(n)));
}

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
    const payload = data?.data && typeof data.data === 'object'
      ? data.data as Record<string, unknown>
      : (data && typeof data === 'object' ? data as Record<string, unknown> : {});
    const scalarData = pickResumeScalarData(payload);
    const resume = await this.prisma.resume.create({
      data: {
        ...scalarData,
        title: String(scalarData.title || '未命名简历'),
        firstName: String(scalarData.firstName || ''),
        lastName: String(scalarData.lastName || ''),
        certifications: Array.isArray(scalarData.certifications) ? scalarData.certifications as string[] : [],
        languages: Array.isArray(scalarData.languages) ? scalarData.languages as string[] : [],
        userId,
      },
    });
    await this.prisma.resumeVersion.create({
      data: { resumeId: resume.id, version: 1, snapshot: resume as any, createdBy: 'initial' },
    });
    return resume;
  }

  async update(id: string, userId: string, data: any) {
    const payload = (data && typeof data === 'object') ? data as Record<string, unknown> : {};
    const scalarData = pickResumeScalarData(payload);
    const experienceList = Array.isArray(payload.experience) ? payload.experience as Array<Record<string, unknown>> : [];
    const educationList = Array.isArray(payload.education) ? payload.education as Array<Record<string, unknown>> : [];
    const skillList = Array.isArray(payload.skills) ? payload.skills as Array<Record<string, unknown>> : [];

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.resumeExperience.deleteMany({ where: { resumeId: id } });
      await tx.resumeEducation.deleteMany({ where: { resumeId: id } });
      await tx.resumeSkill.deleteMany({ where: { resumeId: id } });

      if (experienceList.length > 0) {
        await tx.resumeExperience.createMany({
          data: experienceList.map((item, index) => ({
            resumeId: id,
            title: String(item.title || ''),
            companyName: String(item.companyName || ''),
            city: item.city ? String(item.city) : null,
            state: item.state ? String(item.state) : null,
            startDate: String(item.startDate || ''),
            endDate: item.endDate ? String(item.endDate) : null,
            currentlyWorking: Boolean(item.currentlyWorking),
            workSummary: item.workSummary ? String(item.workSummary) : null,
            aiGenerated: Boolean(item.aiGenerated),
            sortOrder: index,
          })),
        });
      }

      if (educationList.length > 0) {
        await tx.resumeEducation.createMany({
          data: educationList.map((item, index) => ({
            resumeId: id,
            universityName: String(item.universityName || ''),
            degree: String(item.degree || ''),
            major: item.major ? String(item.major) : null,
            startDate: String(item.startDate || ''),
            endDate: item.endDate ? String(item.endDate) : null,
            description: item.description ? String(item.description) : null,
            sortOrder: index,
          })),
        });
      }

      if (skillList.length > 0) {
        await tx.resumeSkill.createMany({
          data: skillList.map((item, index) => ({
            resumeId: id,
            name: String(item.name || ''),
            rating: normalizeRating(item.rating),
            sortOrder: index,
          })),
        });
      }

      const updated = await tx.resume.update({
        where: { id },
        data: scalarData,
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

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
