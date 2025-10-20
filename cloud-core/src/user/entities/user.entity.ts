import { FileShareEntity } from "src/file/entities/file-share.entity";
import { FileEntity } from "src/file/entities/file.entity";
import { FolderShareEntity } from "src/folder/entities/folder-share.entity";
import { FolderEntity } from "src/folder/entities/folder.entity";


export class UserEntity {
  id: string;
  email: string;
  name: string;

  storageQuota: number;
  storageUsed: number;

  rootFolderId?: string | null;

  ownedFolders?: FolderEntity[];
  ownedFiles?: FileEntity[];
  folderShares?: FolderShareEntity[];
  fileShares?: FileShareEntity[];

  createdAt: Date;
  updatedAt: Date;
}
