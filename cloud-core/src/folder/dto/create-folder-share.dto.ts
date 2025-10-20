import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FolderRole } from 'generated/prisma';

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
