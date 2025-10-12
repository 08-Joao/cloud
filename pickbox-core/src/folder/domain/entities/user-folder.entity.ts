import { FolderRole } from "generated/prisma";
import { UserEntity } from "src/user/domain/entities/user.entity";
import { FolderEntity } from "./folder.entity";

export class UserFolderEntity {
    readonly id: number;
    readonly userId: string;
    readonly user?: UserEntity;
    readonly userRole: FolderRole;
    readonly folderId: string;   
    readonly folder?: FolderEntity;
}