import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/application/user.module';
import { AuthModule } from './auth/application/auth.module';
import { FolderModule } from './folder/application/folder.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, FolderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
