import { Module } from '@nestjs/common';
import { FolderController } from '../infrastructure/controllers/folder.controller';
import { FolderService } from './services/folder.service';

@Module({
  controllers: [FolderController],
  providers: [FolderService],
})
export class FolderModule {}
