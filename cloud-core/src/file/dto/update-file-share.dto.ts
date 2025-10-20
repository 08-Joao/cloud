import { PartialType } from '@nestjs/mapped-types';
import { CreateFileShareDto } from './create-file-share.dto';

export class UpdateFileShareDto extends PartialType(CreateFileShareDto) {}
