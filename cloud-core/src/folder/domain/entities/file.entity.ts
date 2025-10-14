import { UserEntity } from "src/user/domain/entities/user.entity";

export class FileEntity {
    readonly id: string;
    readonly filename: string;
    readonly originalName: string;
    readonly mimeType: string;
    readonly size: number;
    readonly path: string;
    readonly isPublic: boolean;
    readonly ownerId: string; 
    readonly folderId: string;
    readonly user?: UserEntity;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}