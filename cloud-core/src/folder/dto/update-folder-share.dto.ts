import { PartialType } from '@nestjs/mapped-types';
import { CreateFolderShareDto } from './create-folder-share.dto';

export class UpdateFolderShareDto extends PartialType(CreateFolderShareDto) {}
