import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    
    // Extract token from httpOnly cookie
    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      
      // Attach user payload to request object
      request['user'] = payload;
      request['userId'] = payload.id;
    } catch (error) {
      // Limpa o cookie inválido/expirado
      response.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
