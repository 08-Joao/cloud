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
import { FolderShareService } from 'src/folder/application/services/folder-share.service';
import { CreateFolderShareDto } from 'src/folder/dto/create-folder-share.dto';
import { UpdateFolderShareDto } from 'src/folder/dto/update-folder-share.dto';
import { AuthGuard } from 'src/auth/infrastructure/guards/auth.guard';

@Controller('folder-shares')
@UseGuards(AuthGuard)
export class FolderShareController {
  constructor(private readonly folderShareService: FolderShareService) {}

  @Post()
  create(@Body() createDto: CreateFolderShareDto, @Request() req) {
    return this.folderShareService.create(createDto, req.user.id);
  }

  @Get('folder/:folderId')
  findByFolder(@Param('folderId') folderId: string, @Request() req) {
    return this.folderShareService.findByFolder(folderId, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFolderShareDto, @Request() req) {
    return this.folderShareService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.folderShareService.remove(id, req.user.id);
  }
}
