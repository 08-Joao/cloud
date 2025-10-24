import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFolderShareDto } from 'src/folder/dto/create-folder-share.dto';
import { UpdateFolderShareDto } from 'src/folder/dto/update-folder-share.dto';
import { FolderShareEntity } from 'src/folder/entities/folder-share.entity';

@Injectable()
export class FolderShareService {
  private readonly logger = new Logger(FolderShareService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Compartilha uma pasta com um usuário
   */
  async create(createDto: CreateFolderShareDto, ownerId: string): Promise<FolderShareEntity> {
    const { folderId, userId, role } = createDto;

    // Verifica se a pasta existe e se o usuário é o dono
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Pasta não encontrada');
    }

    if (folder.ownerId !== ownerId) {
      throw new ForbiddenException('Apenas o dono pode compartilhar esta pasta');
    }

    // Não pode compartilhar consigo mesmo
    if (userId === ownerId) {
      throw new BadRequestException('Você não pode compartilhar uma pasta consigo mesmo');
    }

    // Verifica se o usuário alvo existe
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se já existe compartilhamento
    const existingShare = await this.prisma.folderShare.findUnique({
      where: {
        folderId_userId: {
          folderId,
          userId,
        },
      },
    });

    if (existingShare) {
      throw new BadRequestException('Esta pasta já está compartilhada com este usuário');
    }

    try {
      const share = await this.prisma.folderShare.create({
        data: {
          folderId,
          userId,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Pasta ${folderId} compartilhada com usuário ${userId}`);
      return share;
    } catch (error) {
      this.logger.error('Erro ao compartilhar pasta', error);
      throw error;
    }
  }

  /**
   * Lista compartilhamentos de uma pasta
   */
  async findByFolder(folderId: string, userId: string): Promise<FolderShareEntity[]> {
    // Verifica se o usuário é o dono da pasta
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Pasta não encontrada');
    }

    if (folder.ownerId !== userId) {
      throw new ForbiddenException('Apenas o dono pode ver os compartilhamentos');
    }

    return this.prisma.folderShare.findMany({
      where: { folderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza permissão de compartilhamento
   */
  async update(
    id: string,
    updateDto: UpdateFolderShareDto,
    ownerId: string,
  ): Promise<FolderShareEntity> {
    const share = await this.prisma.folderShare.findUnique({
      where: { id },
      include: { folder: true },
    });

    if (!share) {
      throw new NotFoundException('Compartilhamento não encontrado');
    }

    if (share.folder.ownerId !== ownerId) {
      throw new ForbiddenException('Apenas o dono pode atualizar compartilhamentos');
    }

    try {
      const updatedShare = await this.prisma.folderShare.update({
        where: { id },
        data: updateDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Compartilhamento ${id} atualizado`);
      return updatedShare;
    } catch (error) {
      this.logger.error('Erro ao atualizar compartilhamento', error);
      throw error;
    }
  }

  /**
   * Remove compartilhamento
   */
  async remove(id: string, ownerId: string): Promise<void> {
    const share = await this.prisma.folderShare.findUnique({
      where: { id },
      include: { folder: true },
    });

    if (!share) {
      throw new NotFoundException('Compartilhamento não encontrado');
    }

    if (share.folder.ownerId !== ownerId) {
      throw new ForbiddenException('Apenas o dono pode remover compartilhamentos');
    }

    try {
      await this.prisma.folderShare.delete({
        where: { id },
      });

      this.logger.log(`Compartilhamento ${id} removido`);
    } catch (error) {
      this.logger.error('Erro ao remover compartilhamento', error);
      throw error;
    }
  }
}
