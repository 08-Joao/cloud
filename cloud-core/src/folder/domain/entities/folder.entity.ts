import { FileEntity } from "src/folder/domain/entities/file.entity";
import { UserFolderEntity } from "./user-folder.entity";

export class FolderEntity {
    readonly id: string;
    readonly name: string;
    readonly files?: FileEntity[]
    readonly userFolder?: UserFolderEntity[]
}