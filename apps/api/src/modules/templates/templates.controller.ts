import { Controller, Get, Param, HttpException, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Controller('api/templates')
export class TemplatesController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Get()
  async list() {
    const data = await this.prisma.template.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { data };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) throw new HttpException('Template not found', 404);
    return { data: template };
  }
}
