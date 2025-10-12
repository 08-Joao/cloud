import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from '../infrastructure/controllers/user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { FolderModule } from 'src/folder/application/folder.module';

@Module({
  imports: [
    PrismaModule, 
    forwardRef(() => FolderModule) 
  ],
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}