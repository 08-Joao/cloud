import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFolderDto } from 'src/folder/dto/create-folder.dto';
import { UpdateFolderDto } from 'src/folder/dto/update-folder.dto';
import { FolderEntity } from 'src/folder/entities/folder.entity';
import { FolderRole } from '@prisma/client';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * Cria uma nova pasta
   */
  async create(createFolderDto: CreateFolderDto, userId: string): Promise<FolderEntity> {
    const { name, parentId, isPublic, color, description } = createFolderDto;

    // Valida se a pasta pai existe e se o usuário tem permissão
    if (parentId) {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: parentId },
        include: { shares: true },
      });

      if (!parentFolder) {
        throw new NotFoundException('Pasta pai não encontrada');
      }

      // Verifica se o usuário tem permissão de editar a pasta pai
      const hasPermission = await this.checkUserPermission(parentId, userId, 'EDITOR');
      if (!hasPermission) {
        throw new ForbiddenException('Você não tem permissão para criar pastas aqui');
      }
    }

    try {
      const folder = await this.prisma.folder.create({
        data: {
          name,
          ownerId: userId,
          parentId,
          isPublic: isPublic ?? false,
          color,
          description,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Pasta ${folder.name} criada por usuário ${userId}`);
      return folder;
    } catch (error) {
      this.logger.error('Erro ao criar pasta', error);
      throw error;
    }
  }

  /**
   * Lista todas as pastas do usuário autenticado
   */
  async findAll(userId: string): Promise<FolderEntity[]> {
    return this.prisma.folder.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            shares: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        subfolders: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            files: true,
            subfolders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }



  /**
   * Busca uma pasta por ID
   */
  async findOne(id: string, userId: string): Promise<FolderEntity> {
    let searchId = id;

    if (id === 'myFiles') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { rootFolder: true }
      });

      if (!user?.rootFolder?.id) {
        throw new NotFoundException('Pasta raiz não encontrada para o usuário');
      }

      searchId = user.rootFolder.id;
    }

    const folder = await this.prisma.folder.findUnique({
      where: { id: searchId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        subfolders: {
          include: {
            _count: {
              select: {
                files: true,
                subfolders: true,
              },
            },
          },
        },
        files: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!folder) {
      throw new NotFoundException('Pasta não encontrada');
    }

    // Verifica se o usuário tem permissão para visualizar
    const hasPermission = await this.checkUserPermission(searchId, userId, 'VIEWER');
    if (!hasPermission && !folder.isPublic) {
      throw new ForbiddenException('Você não tem permissão para acessar esta pasta');
    }

    return folder;
  }

  /**
   * Atualiza uma pasta
   */
  async update(id: string, updateFolderDto: UpdateFolderDto, userId: string): Promise<FolderEntity> {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('Pasta não encontrada');
    }

    // if(updateFolderDto.ownerId !== folder.ownerId){
    //   throw new ForbiddenException('Você não pode mudar o dono da pasta por aqui.');
    // }

    // if(updateFolderDto.parentId !== folder.parentId){
    //   const newParentFolder = await this.prisma.folder.findUnique({
    //     where: { id: updateFolderDto.parentId }
    //   });

    //   if(!newParentFolder){
    //     throw new NotFoundException('Pasta pai não encontrada');
    //   }

    //   if(newParentFolder.ownerId !== folder.ownerId){
    //     throw new ForbiddenException('Você não tem permissão para mover esta pasta para outra pessoa.');
    //   }
    // }

    // Verifica se o usuário tem permissão de editar

    const hasPermission = await this.checkUserPermission(id, userId, 'EDITOR');
    if (!hasPermission) {
      throw new ForbiddenException('Você não tem permissão para editar esta pasta');
    }

    try {
      const updatedFolder = await this.prisma.folder.update({
        where: { id },
        data: updateFolderDto,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Pasta ${id} atualizada por usuário ${userId}`);
      return updatedFolder;
    } catch (error) {
      this.logger.error('Erro ao atualizar pasta', error);
      throw error;
    }
  }

  /**
   * Remove uma pasta (com opção recursiva)
   */
  async remove(id: string, userId: string, recursive: boolean = false): Promise<void> {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        subfolders: true,
        files: true,
      },
    });

    if (!folder) {
      throw new NotFoundException('Pasta não encontrada');
    }

    // Apenas o dono pode deletar
    if (folder.ownerId !== userId) {
      throw new ForbiddenException('Apenas o dono pode deletar esta pasta');
    }

    // Verifica se a pasta está vazia (se não for recursivo)
    if (!recursive && (folder.subfolders.length > 0 || folder.files.length > 0)) {
      throw new BadRequestException(
        'A pasta não está vazia. Use recursive=true para deletar com conteúdo',
      );
    }

    try {
      // O Prisma vai deletar em cascata se configurado no schema
      await this.prisma.folder.delete({
        where: { id },
      });

      this.logger.log(`Pasta ${id} deletada por usuário ${userId}`);
    } catch (error) {
      this.logger.error('Erro ao deletar pasta', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário tem permissão na pasta
   */
  async checkUserPermission(
    folderId: string,
    userId: string,
    requiredRole: FolderRole,
  ): Promise<boolean> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        shares: {
          where: {
            userId,
          },
        },
      },
    });

    if (!folder) {
      return false;
    }

    // Dono tem todas as permissões
    if (folder.ownerId === userId) {
      return true;
    }

    // Verifica compartilhamento
    const share = folder.shares[0];
    if (!share) {
      return false;
    }

    // Hierarquia de permissões: OWNER > EDITOR > VIEWER
    const roleHierarchy = {
      OWNER: 3,
      EDITOR: 2,
      VIEWER: 1,
    };

    return roleHierarchy[share.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Lista pastas compartilhadas com o usuário
   */
  async findSharedWithMe(userId: string) {
    return this.prisma.folder.findMany({
      where: {
        shares: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shares: {
          where: {
            userId,
          },
        },
        _count: {
          select: {
            files: true,
            subfolders: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Lista pastas compartilhadas pelo usuário
   */
  async findSharedByMe(userId: string) {
    return this.prisma.folder.findMany({
      where: {
        ownerId: userId,
        shares: {
          some: {},
        },
      },
      include: {
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            subfolders: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}
