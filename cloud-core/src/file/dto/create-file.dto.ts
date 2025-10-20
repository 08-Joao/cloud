import { IsBoolean, IsInt, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateFileDto {
  @IsString()
  name: string;

  @IsString()
  originalName: string;

  @IsString()
  storageKey: string;

  @IsString()
  bucketName: string;

  @IsString()
  mimeType: string;

  @IsInt()
  size: number;

  @IsString()
  folderId: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  publicSlug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsInt()
  version?: number;

  @IsOptional()
  @IsString()
  contentHash?: string;
}
