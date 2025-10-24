import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserController } from '../infrastructure/controllers/user.controller';
import { UserService } from './services/user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/application/auth.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}