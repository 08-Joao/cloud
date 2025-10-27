import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileService } from './application/services/file.service';
import { AuthGuard } from 'src/auth/infrastructure/guards/auth.guard';
import { BackblazeService } from '../backblaze/backblaze.service';
import { BadRequestException } from '@nestjs/common';
import { Public } from 'src/auth/infrastructure/decorators/public.decorator';

@Controller('files')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService, private readonly backblazeService: BackblazeService) {}

  @Post('upload')
  async uploadFile(@Request() req: FastifyRequest & { file: () => Promise<MultipartFile> }) {
    // Fastify multipart - o arquivo vem em req.file ou através de multipart
    const data = await req.file();
    
    if (!data) {
      throw new Error('Nenhum arquivo enviado');
    }

    const buffer = await data.toBuffer();
    const file = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
      size: buffer.length,
    } as Express.Multer.File;

    // Pega os campos do form-data
    const fields = data.fields as any;
    const uploadDto = {
      name: fields.name?.value || data.filename,
      folderId: fields.folderId?.value,
      description: fields.description?.value,
      tags: fields.tags?.value ? JSON.parse(fields.tags.value) : [],
    };

    return this.fileService.uploadFile(file, uploadDto, (req as any).user.id);
  }

  @Post('upload/signed')
  async generateSignedUploadUrl(
    @Request() req,
    @Body() body: { fileName: string, mimeType: string }
  ) {
    const { fileName, mimeType } = body;
    
    return this.backblazeService.generateSignedUploadUrl(
      fileName,
      mimeType,
      req.user.id
    );
  }

  @Post('upload/complete')
  async completeUpload(
    @Request() req,
    @Body() body: { storageKey: string, metadata: { name: string, folderId: string, size: number, mimeType: string, originalName: string } }
  ) {
    return this.fileService.registerUploadedFile(
      body.storageKey,
      {
        ...body.metadata,
        description: '',
        tags: [],
        contentHash: undefined
      },
      req.user.id
    );
  }

  @Get()
  findAll(@Request() req, @Query('folderId') folderId?: string) {
    return this.fileService.findAll(req.user.id, folderId);
  }

  @Get('shared-with-me')
  findSharedWithMe(@Request() req) {
    return this.fileService.findSharedWithMe(req.user.id);
  }

  @Get('shared-by-me')
  findSharedByMe(@Request() req) {
    return this.fileService.findSharedByMe(req.user.id);
  }

  @Public()
  @Get('download/:fileId/:token')
  async downloadFileWithToken(
    @Param('fileId') fileId: string,
    @Param('token') token: string
  ) {
    const downloadUrl = await this.fileService.getDownloadUrlWithToken(token, fileId);
    return { downloadUrl };
  }

  @Get(':id/download-token')
  async generateDownloadToken(@Param('id') id: string, @Request() req) {
    const file = await this.fileService.findOne(id, req.user.id);
    const token = this.fileService.generateDownloadToken(id, req.user.id);
    return { token, fileId: id };
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Request() req, @Res() res: FastifyReply) {
    const { buffer, file } = await this.fileService.downloadFile(id, req.user.id);

    res
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `attachment; filename="${file.name}"`)
      .header('Content-Length', buffer.length.toString())
      .send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.fileService.findOne(id, req.user.id);
  }

  @Get('upload-url')
  async getUploadUrl(
    @Query('fileName') fileName: string,
    @Query('mimeType') mimeType: string,
    @Request() req: FastifyRequest & { user: { id: string } }
  ) {
    if (!fileName || !mimeType) {
      throw new BadRequestException('fileName e mimeType são obrigatórios');
    }

    return this.backblazeService.generateSignedUploadUrl(
      fileName,
      mimeType,
      req.user.id
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto, @Request() req) {
    return this.fileService.update(id, updateFileDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.fileService.remove(id, req.user.id);
  }
}
