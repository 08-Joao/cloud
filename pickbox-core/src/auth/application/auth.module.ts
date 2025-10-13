import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from '../infrastructure/controllers/auth.controller';
import { UserModule } from 'src/user/application/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, UserModule, JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
  })],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, JwtModule]
})
export class AuthModule {}
