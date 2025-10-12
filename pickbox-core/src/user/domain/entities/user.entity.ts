import { FileEntity } from "src/folder/domain/entities/file.entity";

export class UserEntity {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly generalFolderId?: string | null;
    readonly files?: FileEntity[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
