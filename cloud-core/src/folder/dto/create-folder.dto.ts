import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
