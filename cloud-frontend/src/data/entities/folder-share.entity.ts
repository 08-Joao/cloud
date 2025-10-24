import { FolderRole } from "../enums/FolderRole.enum";

export interface FolderShareEntity {
  id: string;
  folderId: string;
  userId: string;
  role: FolderRole;
  organizationDomain?: string | null;
  createdAt: Date;
  updatedAt: Date;
}