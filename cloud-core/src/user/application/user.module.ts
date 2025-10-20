import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserController } from '../infrastructure/controllers/user.controller';
import { UserService } from './services/user.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}