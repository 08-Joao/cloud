// Baseado nas suas entidades do backend

export enum FolderRole {
    OWNER = 'OWNER',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER',
}

export interface FileEntity {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    isPublic: boolean;
    ownerId: string;
    folderId: string;
    createdAt: string; // Usar string para datas que vêm de JSON
    updatedAt: string;
}

export interface FolderEntity {
    id: string;
    name: string;
    files?: FileEntity[];
    subFolders?: FolderEntity[]; // Adicionado para estrutura de subpastas
    userFolder?: UserFolderEntity[];
}

export interface UserFolderEntity {
    id: number;
    userId: string;
    userRole: FolderRole;
    folderId: string;
}

export interface GetUserDto {
    id: string;
    name: string;
    email: string;
    generalFolderId?: string | null;
    createdAt: string;
    updatedAt: string;
}

// Para o conteúdo de uma pasta
export interface FolderContent {
    id: string;
    name: string;
    files: FileEntity[];
    subFolders: FolderEntity[];
    // breadcrumbs para navegação
    path: { id: string, name: string }[];
}