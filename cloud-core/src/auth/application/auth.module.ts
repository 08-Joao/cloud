import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/application/user.module';
import { AuthGuard } from '../infrastructure/guards/auth.guard';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    UserModule, 
  ],
  providers: [AuthGuard],
  exports: [AuthGuard],
})

export class AuthModule {}
