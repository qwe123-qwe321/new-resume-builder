import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-resume-dev-secret-change-in-production';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return false;

    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string };
      (req as any).userId = payload.userId;
      return true;
    } catch {
      return false;
    }
  }
}
