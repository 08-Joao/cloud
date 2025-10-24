import { Module } from '@nestjs/common';
import { BackblazeService } from './backblaze.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BackblazeService],
  exports: [BackblazeService],
})
export class BackblazeModule {}
