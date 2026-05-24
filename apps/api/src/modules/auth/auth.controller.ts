import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpException, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
    const { email, password, firstName, lastName } = body;
    if (!email || !password) throw new HttpException('Email and password required', 400);
    try {
      const result = await this.authService.register(email, password, firstName || '', lastName || '');
      return result;
    } catch (err: any) {
      if (err.message === 'Email already registered') throw new HttpException(err.message, 409);
      throw new HttpException('Registration failed', 500);
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) throw new HttpException('Email and password required', 400);
    try {
      return await this.authService.login(email, password);
    } catch (err: any) {
      if (err.message === 'Invalid credentials') throw new HttpException(err.message, 401);
      throw new HttpException('Login failed', 500);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const userId = (req as any).userId;
    const user = await this.authService.me(userId);
    if (!user) throw new HttpException('User not found', 404);
    return { data: user };
  }
}
