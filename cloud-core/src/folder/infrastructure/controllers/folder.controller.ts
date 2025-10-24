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
} from '@nestjs/common';
import { CreateFolderDto } from '../../dto/create-folder.dto';
import { UpdateFolderDto } from '../../dto/update-folder.dto';
import { FolderService } from 'src/folder/application/services/folder.service';
import { AuthGuard } from 'src/auth/infrastructure/guards/auth.guard';

@Controller('folders')
@UseGuards(AuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  create(@Body() createFolderDto: CreateFolderDto, @Request() req) {
    return this.folderService.create(createFolderDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.folderService.findAll(req.user.id);
  }

  @Get('shared-with-me')
  findSharedWithMe(@Request() req) {
    return this.folderService.findSharedWithMe(req.user.id);
  }

  @Get('shared-by-me')
  findSharedByMe(@Request() req) {
    return this.folderService.findSharedByMe(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.folderService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto, @Request() req) {
    return this.folderService.update(id, updateFolderDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('recursive') recursive: string, @Request() req) {
    const isRecursive = recursive === 'true';
    return this.folderService.remove(id, req.user.id, isRecursive);
  }
}
