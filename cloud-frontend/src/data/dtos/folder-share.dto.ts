import { FolderRole } from "@/data/enums/FolderRole.enum";

export interface CreateFolderShareDto {
  folderId: string;
  userId: string;
  role: FolderRole;
  organizationDomain?: string;
}

export interface UpdateFolderShareDto {
  role: FolderRole;
}
