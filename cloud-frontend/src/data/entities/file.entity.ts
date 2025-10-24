import { FileShareEntity } from "./file-share.entity";

export interface FileEntity {
  id: string;
  name: string;
  originalName: string;
  storageKey: string;
  bucketName: string;
  mimeType: string;
  size: number;
  folderId: string;
  ownerId: string;
  isPublic: boolean;
  publicSlug?: string | null;
  description?: string | null;
  tags?: string[];
  version: number;
  contentHash?: string | null;
  shares?: FileShareEntity[];
  createdAt: Date;
  updatedAt: Date;
}
