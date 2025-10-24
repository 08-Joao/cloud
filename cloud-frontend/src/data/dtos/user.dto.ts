export interface User {
  id: string;
  email: string;
  name: string;
  storageQuota: number;
  storageUsed: number;
  rootFolderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};