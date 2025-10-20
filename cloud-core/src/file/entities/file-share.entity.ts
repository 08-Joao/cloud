import { FileRole } from "generated/prisma";

export class FileShareEntity {
  id: string;
  fileId: string;
  userId: string;
  role: FileRole;
  organizationDomain?: string | null;
  shareToken?: string | null;
  sharePassword?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
