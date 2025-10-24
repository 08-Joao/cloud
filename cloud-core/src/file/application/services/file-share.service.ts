import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileShareDto } from 'src/file/dto/create-file-share.dto';
import { UpdateFileShareDto } from 'src/file/dto/update-file-share.dto';
import { FileShareEntity } from 'src/file/entities/file-share.entity';

@Injectable()
export class FileShareService {
  private readonly logger = new Logger(FileShareService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Compartilha um arquivo com um usuário
   */
  async create(createDto: CreateFileShareDto, ownerId: string): Promise<FileShareEntity> {
    const { fileId, userId, role } = createDto;

    // Verifica se o arquivo existe e se o usuário é o dono
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    if (file.ownerId !== ownerId) {
      throw new ForbiddenException('Apenas o dono pode compartilhar este arquivo');
    }

    // Não pode compartilhar consigo mesmo
    if (userId === ownerId) {
      throw new BadRequestException('Você não pode compartilhar um arquivo consigo mesmo');
    }

    // Verifica se o usuário alvo existe
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se já existe compartilhamento
    const existingShare = await this.prisma.fileShare.findUnique({
      where: {
        fileId_userId: {
          fileId,
          userId,
        },
      },
    });

    if (existingShare) {
      throw new BadRequestException('Este arquivo já está compartilhado com este usuário');
    }

    try {
      const share = await this.prisma.fileShare.create({
        data: {
          fileId,
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
          file: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Arquivo ${fileId} compartilhado com usuário ${userId}`);
      return share;
    } catch (error) {
      this.logger.error('Erro ao compartilhar arquivo', error);
      throw error;
    }
  }

  /**
   * Lista compartilhamentos de um arquivo
   */
  async findByFile(fileId: string, userId: string): Promise<FileShareEntity[]> {
    // Verifica se o usuário é o dono do arquivo
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Apenas o dono pode ver os compartilhamentos');
    }

    return this.prisma.fileShare.findMany({
      where: { fileId },
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
  async update(id: string, updateDto: UpdateFileShareDto, ownerId: string): Promise<FileShareEntity> {
    const share = await this.prisma.fileShare.findUnique({
      where: { id },
      include: { file: true },
    });

    if (!share) {
      throw new NotFoundException('Compartilhamento não encontrado');
    }

    if (share.file.ownerId !== ownerId) {
      throw new ForbiddenException('Apenas o dono pode atualizar compartilhamentos');
    }

    try {
      const updatedShare = await this.prisma.fileShare.update({
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
    const share = await this.prisma.fileShare.findUnique({
      where: { id },
      include: { file: true },
    });

    if (!share) {
      throw new NotFoundException('Compartilhamento não encontrado');
    }

    if (share.file.ownerId !== ownerId) {
      throw new ForbiddenException('Apenas o dono pode remover compartilhamentos');
    }

    try {
      await this.prisma.fileShare.delete({
        where: { id },
      });

      this.logger.log(`Compartilhamento ${id} removido`);
    } catch (error) {
      this.logger.error('Erro ao remover compartilhamento', error);
      throw error;
    }
  }
}
