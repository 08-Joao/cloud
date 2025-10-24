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
} from '@nestjs/common';
import { FileShareService } from 'src/file/application/services/file-share.service';
import { CreateFileShareDto } from 'src/file/dto/create-file-share.dto';
import { UpdateFileShareDto } from 'src/file/dto/update-file-share.dto';
import { AuthGuard } from 'src/auth/infrastructure/guards/auth.guard';

@Controller('file-shares')
@UseGuards(AuthGuard)
export class FileShareController {
  constructor(private readonly fileShareService: FileShareService) {}

  @Post()
  create(@Body() createDto: CreateFileShareDto, @Request() req) {
    return this.fileShareService.create(createDto, req.user.id);
  }

  @Get('file/:fileId')
  findByFile(@Param('fileId') fileId: string, @Request() req) {
    return this.fileShareService.findByFile(fileId, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFileShareDto, @Request() req) {
    return this.fileShareService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.fileShareService.remove(id, req.user.id);
  }
}
