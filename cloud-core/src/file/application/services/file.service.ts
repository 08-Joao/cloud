import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { UserService } from 'src/user/application/services/user.service';
import { CreateFileDto } from 'src/file/dto/create-file.dto';
import { UpdateFileDto } from 'src/file/dto/update-file.dto';
import { UploadFileDto } from 'src/file/dto/upload-file.dto';
import { FileEntity } from 'src/file/entities/file.entity';
import { FileRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

  constructor(
    private prisma: PrismaService,
    private backblazeService: BackblazeService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  /**
   * Faz upload de arquivo
   */
  async uploadFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
    userId: string,
  ): Promise<FileEntity> {
    // Valida tamanho do arquivo
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Verifica se a pasta existe e se o usuário tem permissão
    const folder = await this.prisma.folder.findUnique({
      where: { id: uploadDto.folderId },
      include: { shares: true },
    });

    if (!folder) {
      throw new NotFoundException('Pasta não encontrada');
    }

    // Verifica permissão de escrita
    const hasPermission =
      folder.ownerId === userId ||
      folder.shares.some((share) => share.userId === userId && share.role === 'EDITOR');

    if (!hasPermission) {
      throw new ForbiddenException('Você não tem permissão para fazer upload nesta pasta');
    }

    // Verifica quota de armazenamento
    const hasSpace = await this.userService.hasStorageSpace(userId, file.size);
    if (!hasSpace) {
      throw new BadRequestException('Quota de armazenamento excedida');
    }

    try {
      // Calcula hash do arquivo
      const contentHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

      // Faz upload para Backblaze
      const { storageKey, publicUrl } = await this.backblazeService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        userId,
      );

      // Salva no banco
      const bucketName = this.configService.get<string>('B2_BUCKET_NAME') || '';
      const createdFile = await this.prisma.file.create({
        data: {
          name: uploadDto.name || file.originalname,
          originalName: file.originalname,
          storageKey,
          bucketName,
          mimeType: file.mimetype,
          size: file.size,
          folderId: uploadDto.folderId,
          ownerId: userId,
          description: uploadDto.description,
          tags: uploadDto.tags || [],
          contentHash,
        },
        include: {
          owner: {
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

      // Atualiza uso de armazenamento
      await this.userService.updateStorageUsed(userId, file.size, 'increment');

      this.logger.log(`Arquivo ${createdFile.name} enviado por usuário ${userId}`);

      // Adiciona URL pública ao retorno
      return {
        ...createdFile,
        publicUrl,
      } as any;
    } catch (error) {
      this.logger.error('Erro ao fazer upload do arquivo', error);
      throw error;
    }
  }

  /**
   * Lista todos os arquivos do usuário ou de uma pasta específica
   */
  async findAll(userId: string, folderId?: string): Promise<FileEntity[]> {
    const where: any = {
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
    };

    if (folderId) {
      where.folderId = folderId;
    }

    const files = await this.prisma.file.findMany({
      where,
      include: {
        owner: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Adiciona URL pública a cada arquivo
    return files.map((file) => ({
      ...file,
      publicUrl: this.backblazeService.getPublicUrl(file.storageKey),
    })) as any;
  }

  /**
   * Busca um arquivo por ID
   */
  async findOne(id: string, userId: string): Promise<FileEntity> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        owner: {
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

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Verifica permissão
    const hasPermission = await this.checkUserPermission(id, userId, 'VIEWER');
    if (!hasPermission && !file.isPublic) {
      throw new ForbiddenException('Você não tem permissão para acessar este arquivo');
    }

    return {
      ...file,
      publicUrl: this.backblazeService.getPublicUrl(file.storageKey),
    } as any;
  }

  /**
   * Faz download de arquivo
   */
  async downloadFile(id: string, userId: string): Promise<{ buffer: Buffer; file: FileEntity }> {
    const file = await this.findOne(id, userId);

    try {
      const buffer = await this.backblazeService.downloadFile(file.storageKey);
      this.logger.log(`Arquivo ${file.name} baixado por usuário ${userId}`);

      return { buffer, file };
    } catch (error) {
      this.logger.error('Erro ao fazer download do arquivo', error);
      throw error;
    }
  }

  /**
   * Atualiza metadados do arquivo
   */
  async update(id: string, updateFileDto: UpdateFileDto, userId: string): Promise<FileEntity> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Verifica permissão de edição
    const hasPermission = await this.checkUserPermission(id, userId, 'EDITOR');
    if (!hasPermission) {
      throw new ForbiddenException('Você não tem permissão para editar este arquivo');
    }

    try {
      const updatedFile = await this.prisma.file.update({
        where: { id },
        data: updateFileDto,
        include: {
          owner: {
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

      this.logger.log(`Arquivo ${id} atualizado por usuário ${userId}`);

      return {
        ...updatedFile,
        publicUrl: this.backblazeService.getPublicUrl(updatedFile.storageKey),
      } as any;
    } catch (error) {
      this.logger.error('Erro ao atualizar arquivo', error);
      throw error;
    }
  }

  /**
   * Remove arquivo
   */
  async remove(id: string, userId: string): Promise<void> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Apenas o dono pode deletar
    if (file.ownerId !== userId) {
      throw new ForbiddenException('Apenas o dono pode deletar este arquivo');
    }

    try {
      // Deleta do Backblaze
      await this.backblazeService.deleteFile(file.storageKey);

      // Deleta do banco
      await this.prisma.file.delete({
        where: { id },
      });

      // Atualiza uso de armazenamento
      await this.userService.updateStorageUsed(userId, file.size, 'decrement');

      this.logger.log(`Arquivo ${id} deletado por usuário ${userId}`);
    } catch (error) {
      this.logger.error('Erro ao deletar arquivo', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário tem permissão no arquivo
   */
  async checkUserPermission(
    fileId: string,
    userId: string,
    requiredRole: FileRole,
  ): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: {
        shares: {
          where: {
            userId,
          },
        },
      },
    });

    if (!file) {
      return false;
    }

    // Dono tem todas as permissões
    if (file.ownerId === userId) {
      return true;
    }

    // Verifica compartilhamento
    const share = file.shares[0];
    if (!share) {
      return false;
    }

    // Hierarquia de permissões: EDITOR > VIEWER
    const roleHierarchy = {
      EDITOR: 2,
      VIEWER: 1,
    };

    return roleHierarchy[share.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Lista arquivos compartilhados com o usuário
   */
  async findSharedWithMe(userId: string) {
    const files = await this.prisma.file.findMany({
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
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        shares: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return files.map((file) => ({
      ...file,
      publicUrl: this.backblazeService.getPublicUrl(file.storageKey),
    }));
  }

  /**
   * Lista arquivos compartilhados pelo usuário
   */
  async findSharedByMe(userId: string) {
    const files = await this.prisma.file.findMany({
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
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return files.map((file) => ({
      ...file,
      publicUrl: this.backblazeService.getPublicUrl(file.storageKey),
    }));
  }

  /**
   * Registra um arquivo que foi enviado diretamente para o Backblaze
   */
  async registerUploadedFile(
    storageKey: string,
    metadata: {
      name: string;
      folderId: string; 
      description?: string;
      tags?: string[];
      size: number;
      mimeType: string;
      originalName: string;
      contentHash?: string;
    },
    userId: string
  ): Promise<FileEntity> {
    try {
      const bucketName = this.configService.getOrThrow<string>('B2_BUCKET_NAME');
      
      return this.prisma.file.create({
        data: {
          name: metadata.name,
          originalName: metadata.originalName,
          storageKey,
          bucketName,
          size: metadata.size,
          mimeType: metadata.mimeType,
          description: metadata.description || '',
          folderId: metadata.folderId, 
          tags: metadata.tags || [],
          contentHash: metadata.contentHash || null,
          ownerId: userId,
        },
      });
    } catch (error) {
      this.logger.error('Erro ao registrar arquivo', error);
      throw new InternalServerErrorException('Falha ao registrar arquivo');
    }
  }

  /**
   * Gera um token de download único baseado em HMAC
   */
  generateDownloadToken(fileId: string, userId: string): string {
    const payload = `${fileId}:${userId}`;
    const token = crypto
      .createHmac('sha256', this.configService.getOrThrow<string>('DOWNLOAD_TOKEN_SECRET'))
      .update(payload)
      .digest('hex');
    return token;
  }

  /**
   * Valida token de download e retorna URL pública do Backblaze
   */
  async getDownloadUrlWithToken(token: string, fileId: string): Promise<string> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Validar token - gera o token esperado com o userId do dono
    const expectedToken = this.generateDownloadToken(fileId, file.ownerId);
    if (token !== expectedToken) {
      throw new ForbiddenException('Token de download inválido ou expirado');
    }

    this.logger.log(`URL de download gerada para arquivo ${file.name} via token`);
    return await this.backblazeService.getPublicUrl(file.storageKey);
  }

  /**
   * Valida token de download e retorna o arquivo (legado)
   */
  async downloadFileWithToken(token: string, fileId: string): Promise<{ buffer: Buffer; file: FileEntity }> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Validar token - gera o token esperado com o userId do dono
    const expectedToken = this.generateDownloadToken(fileId, file.ownerId);
    if (token !== expectedToken) {
      throw new ForbiddenException('Token de download inválido ou expirado');
    }

    try {
      const buffer = await this.backblazeService.downloadFile(file.storageKey);
      this.logger.log(`Arquivo ${file.name} baixado via token por usuário ${file.ownerId}`);
      return { buffer, file };
    } catch (error) {
      this.logger.error('Erro ao fazer download do arquivo', error);
      throw error;
    }
  }
}
