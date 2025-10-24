import { UserEntity } from "src/user/entities/user.entity";
import { FolderShareEntity } from "./folder-share.entity";
import { FileEntity } from "src/file/entities/file.entity";

export class FolderEntity {
  id: string;
  name: string;
  parentId?: string | null;
  ownerId: string;
  rootOwner?: UserEntity | null;
  files?: FileEntity[];
  shares?: FolderShareEntity[];

  isPublic: boolean;
  color?: string | null;
  description?: string | null;

  createdAt: Date;
  updatedAt: Date;
}
