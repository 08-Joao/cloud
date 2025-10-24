import { FileRole } from "../enums/FileRole.enum";


export interface CreateFileShareDto {
  fileId: string;
  userId: string;
  role: FileRole;
  organizationDomain?: string;
  shareToken?: string;
  sharePassword?: string;
  expiresAt?: Date;
}

export interface UpdateFileShareDto {
  role: FileRole;
}
