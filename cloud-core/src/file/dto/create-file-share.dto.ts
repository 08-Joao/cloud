import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { FileRole } from 'generated/prisma';

export class CreateFileShareDto {
  @IsString()
  fileId: string;

  @IsString()
  userId: string;

  @IsEnum(FileRole)
  role: FileRole;

  @IsOptional()
  @IsString()
  organizationDomain?: string;

  @IsOptional()
  @IsString()
  shareToken?: string;

  @IsOptional()
  @IsString()
  sharePassword?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
