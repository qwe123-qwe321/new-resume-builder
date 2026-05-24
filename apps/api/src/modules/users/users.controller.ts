import { Controller, Get, Delete, Req, UseGuards, HttpException, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { PrismaService } from '../../common/prisma.service';

@Controller('api/users')
export class UsersController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });
    return { data: user };
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: Request) {
    await this.prisma.user.delete({ where: { id: (req as any).userId } });
    return { data: { success: true } };
  }
}
