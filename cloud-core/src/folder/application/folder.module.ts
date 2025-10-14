import { UserFolderRepository } from '../infrastructure/repositories/user-folder.repository';
import { forwardRef, Module } from '@nestjs/common';
import { FolderService } from './services/folder.service';
import { FolderController } from '../infrastructure/controllers/folder.controller';
import { FolderRepository } from '../infrastructure/repositories/folder.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileService } from './services/file.service';
import { FileRepository } from '../infrastructure/repositories/file.repository';
import { UserFolderService } from './services/user-folder.service';
import { UserModule } from 'src/user/application/user.module';


@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule)
  ],
  providers: [FolderService, UserFolderService, FileService, FolderRepository, UserFolderRepository, FileRepository], 
  controllers: [FolderController],
  exports: [FolderService], 
})
export class FolderModule {}