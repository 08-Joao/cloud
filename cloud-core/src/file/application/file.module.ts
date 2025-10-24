import { Module } from '@nestjs/common';
import { FileController } from '../file.controller';
import { FileShareController } from '../infrastructure/controllers/file-share.controller';
import { FileService } from './services/file.service';
import { FileShareService } from './services/file-share.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/application/auth.module';
import { BackblazeModule } from 'src/backblaze/backblaze.module';
import { UserModule } from 'src/user/application/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuthModule, BackblazeModule, UserModule, ConfigModule],
  controllers: [FileController, FileShareController],
  providers: [FileService, FileShareService],
  exports: [FileService, FileShareService],
})
export class FileModule {}
