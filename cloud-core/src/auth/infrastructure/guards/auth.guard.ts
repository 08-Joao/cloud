// src/auth/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/user/application/services/user.service';


interface AuthResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    birthDate?: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private httpService: HttpService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader || !cookieHeader.includes('accessToken')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {

      // 1. Valida token no api-auth.tehkly.com
      const authResponse = await firstValueFrom(
        this.httpService.get<AuthResponse>(
          `${process.env.AUTH_API_URL}/verify-token`,
          {
            headers: {
              Cookie: cookieHeader,
            },
            timeout: 5000,
            withCredentials: true,
          },
        ),
      );

      const data = authResponse.data;

      
      if (!data.valid) {
        throw new UnauthorizedException('Token inválido');
      }

      const userData = data.user;

      // Valida campos obrigatórios
      if (!userData || !userData.id || !userData.email || !userData.name) {
        throw new UnauthorizedException('Dados de autenticação incompletos');
      }
      // 2. Busca ou CRIA usuário no primeiro acesso
      const user = await this.userService.getOrCreate({
        id: userData.id,
        email: userData.email,
        name: userData.name,
      });

      // 3. Adiciona usuário ao request
      request['user'] = user;

      return true;
    } catch (error) {

      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw se já for UnauthorizedException
      }

      if (error.response?.status === 401) {
        throw new UnauthorizedException('Token inválido');
      }

      if (error.response?.status === 403) {
        throw new UnauthorizedException('Token expirado');
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new UnauthorizedException('Serviço de autenticação indisponível');
      }

      throw new UnauthorizedException('Erro ao validar token');
    }
  }
}