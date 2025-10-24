import { FileEntity } from './file.entity';
import { FolderShareEntity } from './folder-share.entity';

export interface FolderEntity {
  id: string;
  name: string;
  parentId?: string | null;
  ownerId: string;
  files?: FileEntity[];
  subfolders?: FolderEntity[];
  shares?: FolderShareEntity[];

  isPublic: boolean;
  color?: string | null;
  description?: string | null;

  createdAt: Date;
  updatedAt: Date;
}