import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FolderRole } from '@prisma/client';

export class CreateFolderShareDto {
  @IsString()
  folderId: string;

  @IsString()
  userId: string;

  @IsEnum(FolderRole)
  role: FolderRole;

  @IsOptional()
  @IsString()
  organizationDomain?: string;
}
