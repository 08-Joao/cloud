export interface CreateFolderDto {
  name: string;
  ownerId: string;
  parentId?: string;
  isPublic?: boolean;
  color?: string;
  description?: string;
}

export interface UpdateFolderDto {
  name?: string;
  parentId?: string;
  isPublic?: boolean;
  color?: string;
  description?: string;
}


