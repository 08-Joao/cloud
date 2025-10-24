import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class UploadFileDto {
  @IsString()
  name: string;

  @IsUUID()
  folderId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
