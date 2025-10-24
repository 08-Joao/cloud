import { Module } from '@nestjs/common';
import { FolderController } from '../infrastructure/controllers/folder.controller';
import { FolderShareController } from '../infrastructure/controllers/folder-share.controller';
import { FolderService } from './services/folder.service';
import { FolderShareService } from './services/folder-share.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/application/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FolderController, FolderShareController],
  providers: [FolderService, FolderShareService],
  exports: [FolderService, FolderShareService],
})
export class FolderModule {}
