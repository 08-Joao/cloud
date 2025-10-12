import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FolderRole } from 'generated/prisma';
import {
  FolderRoleGuard,
  FolderRoles,
} from 'src/auth/infrastructure/guards/FolderRoleGuard';
import { UserId } from 'src/common/decorators';
import { FolderService } from 'src/folder/application/services/folder.service';
import { UpdateFolderDto } from 'src/folder/dtos/update.folder.dto';
import { CreateUserDto } from 'src/user/dtos/create.user.dto';
import { createMulterConfig } from 'src/folder/common/config/multerConfig';
import { DynamicFilesInterceptor } from 'src/folder/common/interceptors/dynamic-files.interceptor';
import type { Response } from 'express';

@UseGuards(FolderRoleGuard)
@Controller('folder')
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Get()
  getFolders(@UserId() userId: string) {
    return this.folderService.getFolders(userId);
  }

  @Get('/:folderId')
  @FolderRoles({
    folderRole: [FolderRole.OWNER, FolderRole.EDITOR, FolderRole.VIEWER],
  })
  getFolderById(@Param('folderId') folderId: string) {
    return this.folderService.getFolderById(folderId);
  }

  @FolderRoles({
    folderRole: [FolderRole.OWNER, FolderRole.EDITOR, FolderRole.VIEWER],
  })
  @Get('/:folderId/files')
  async getFolderFiles(@Param('folderId') folderId: string) {
    return this.folderService.getFolderFiles(folderId);
  }

  @Get('/download/:fileId')
  @FolderRoles({
    folderRole: [FolderRole.OWNER, FolderRole.EDITOR, FolderRole.VIEWER],
  })
  async downloadFile(
    @UserId() userId: string,
    @Param('folderId') folderId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileData = await this.folderService.downloadFile(userId,folderId);

    // Configurar headers HTTP
    res.setHeader('Content-Type', fileData.mimetype);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileData.filename)}"`,
    );
    res.setHeader('Content-Length', fileData.size);

    return fileData.stream;
  }
  @Post('/create')
  async createFolder(@UserId() userId: string, @Body() data: CreateUserDto) {
    return this.folderService.createFolder(userId, data);
  }

  @Post(':folderId/upload')
  @UseInterceptors(DynamicFilesInterceptor)
  @FolderRoles({ folderRole: [FolderRole.OWNER, FolderRole.EDITOR] })
  async uploadFiles(
    @UserId() userId: string,
    @Param('folderId') folderId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.folderService.uploadFiles(folderId, userId, files);
  }

  @FolderRoles({ folderRole: [FolderRole.OWNER, FolderRole.EDITOR] })
  @Patch('/update/:folderId')
  updateFolder(
    @Param('folderId') folderId: string,
    @Body() data: UpdateFolderDto,
  ) {
    return this.folderService.updateFolder(folderId, data);
  }

  @FolderRoles({ folderRole: [FolderRole.OWNER] })
  @Delete('/delete/:folderId')
  deleteFolder(@Param('folderId') folderId: string) {
    return this.folderService.deleteFolder(folderId);
  }
}
