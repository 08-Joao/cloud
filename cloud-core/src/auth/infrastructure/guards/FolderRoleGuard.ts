import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { FolderRole } from 'generated/prisma';
import { JwtAuthGuard } from './jwt-auth.guard';

export interface RequiredFolderRoles {
  folderRole?: FolderRole | FolderRole[];
  requiresFolder?: boolean;
}

export const FolderRoles = (roles: RequiredFolderRoles) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('folderRoles', roles, descriptor ? descriptor.value : target);
  };
};

@Injectable()
export class FolderRoleGuard implements CanActivate {

  constructor(
    private reflector: Reflector,
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Primeiro verifica se está autenticado usando JwtAuthGuard
    const jwtGuard = new JwtAuthGuard(this.jwtService);
    const isAuthenticated = await jwtGuard.canActivate(context);
    
    if (!isAuthenticated) {
      return false;
    }

    // Pega o userId do request (já foi adicionado pelo JwtAuthGuard)
    const userId = request.userId;

    // Pega as roles necessárias do decorator
    const requiredRoles = this.reflector.get<RequiredFolderRoles>('folderRoles', context.getHandler());
    
    // Se não há roles definidas, permite acesso (apenas autenticação é necessária)
    if (!requiredRoles) {
      return true;
    }

    // Busca o usuário completo no banco
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        userFolders: {
          include: {
            folder: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verifica role de folder se necessário
    if (requiredRoles.folderRole || requiredRoles.requiresFolder) {
      const folderId = request.params?.folderId || request.body?.folderId || request.query?.folderId;
      
      if (requiredRoles.requiresFolder && !folderId) {
        throw new ForbiddenException('Folder ID is required for this endpoint');
      }

      if (folderId) {
        const userFolder = user.userFolders.find(uf => uf.folderId === folderId);
        
        if (!userFolder) {
          throw new ForbiddenException('User does not have access to this folder');
        }

        if (requiredRoles.folderRole) {
          const allowedFolderRoles = Array.isArray(requiredRoles.folderRole) 
            ? requiredRoles.folderRole 
            : [requiredRoles.folderRole];
          
          if (!allowedFolderRoles.includes(userFolder.userRole)) {
            throw new ForbiddenException(`Insufficient folder permissions - required: ${allowedFolderRoles.join(' or ')}`);
          }
          
          // Adiciona informações do folder no request para uso posterior
          request.currentFolder = userFolder.folder;
          request.userFolderRole = userFolder.userRole;
        } else {
          // Se não há role específica necessária, mas requer folder, apenas ser membro é suficiente
          request.currentFolder = userFolder.folder;
          request.userFolderRole = userFolder.userRole;
        }
      } else {
        throw new ForbiddenException('Insufficient folder permissions');
      }
    }

    return true;
  }
}

@Injectable()
export class AuthFolderRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const folderRoleGuard = new FolderRoleGuard(this.reflector, this.jwtService, this.prismaService);
    return await folderRoleGuard.canActivate(context);
  }
}