import { FolderRole } from '@prisma/client';

export class FolderShareEntity {
  id: string;
  folderId: string;
  userId: string;
  role: FolderRole;
  organizationDomain?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
