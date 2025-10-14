import { UserFolderRepository } from '../../infrastructure/repositories/user-folder.repository';
import { FolderRepository } from '../../infrastructure/repositories/folder.repository';
import {
  Injectable,
  Inject,
  forwardRef,
  UnprocessableEntityException,
  NotFoundException,
  StreamableFile,
  ForbiddenException,
} from '@nestjs/common';
import { CreateFolderDto } from 'src/folder/dtos/create.folder.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserFolderDto } from 'src/folder/dtos/create.user-folder.dto';
import { UpdateFolderDto } from 'src/folder/dtos/update.folder.dto';
import { FileService } from 'src/folder/application/services/file.service';
import { CreateFileDto } from 'src/folder/dtos/create.file.dto';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';

@Injectable()
export class FolderService {
  constructor(
    private folderRepository: FolderRepository,
    private prismaService: PrismaService,
    private userFolderRepository: UserFolderRepository,
    @Inject(forwardRef(() => FileService)) private fileService: FileService,
  ) {}

  async getFolders(userId: string) {
    return this.folderRepository.findByUserId(userId);
  }

  async getFolderById(folderId: string) {
    return this.folderRepository.findById(folderId);
  }

  async getFolderFiles(folderId: string) {
    return this.prismaService.file.findMany({ where: { folderId } });
  }

  async downloadFile(userId:string, fileId: string) {
    const file = await this.fileService.getFileById(fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if(!file.isPublic){
      const userFolder = await this.userFolderRepository.findByFolderAndUserId(userId,file.folderId);

      if (!userFolder) {
        throw new ForbiddenException('User does not have access to this folder');
      }
    }

    // Obter o caminho completo do arquivo
    const filePath = await this.fileService.getFilePath(fileId);

    try {
      // Verificar se o arquivo existe no sistema de arquivos
      const fileStats = await stat(filePath);

      // Criar stream de leitura
      const stream = createReadStream(filePath);

      return {
        stream: new StreamableFile(stream),
        filename: file.filename,
        mimetype: file.mimeType || 'application/octet-stream',
        size: fileStats.size,
      };
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  async uploadFiles(
    userId: string,
    folderId: string,
    files: Express.Multer.File[],
  ) {
    let uploadedFiles: CreateFileDto[] = [];

    return this.fileService.createFiles(uploadedFiles);
  }

  async createFolder(userId: string, data: CreateFolderDto) {
    return this.prismaService.$transaction(async (tx) => {
      const folder = await this.folderRepository.create(data);

      const userFolderData = {
        folderId: folder.id,
        userId,
        userRole: 'OWNER',
      } as CreateUserFolderDto;
      const userFolder = await this.userFolderRepository.create(userFolderData);
      return folder;
    });
  }

  async updateFolder(folderId: string, data: UpdateFolderDto) {
    return this.folderRepository.update(folderId, data);
  }

  async deleteFolder(folderId: string) {
    return this.prismaService.$transaction(async (tx) => {
      await this.folderRepository.delete(folderId);

      await this.userFolderRepository.deleteByFolderId(folderId);
      return { message: 'Sucess' };
    });
  }
}
