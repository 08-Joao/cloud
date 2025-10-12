import { CreateFolderDto } from "src/folder/dtos/create.folder.dto"
import { UpdateFolderDto } from "src/folder/dtos/update.folder.dto"
import { FolderEntity } from "../entities/folder.entity"

export interface IFolderRepository { 
    findById(folderId: string): Promise<FolderEntity | null>
    findByUserId(userId: string): Promise<FolderEntity[]>
    create(data: CreateFolderDto): Promise<FolderEntity>
    update(folderId: string,data: UpdateFolderDto): Promise<FolderEntity>
    delete(folderId: string): Promise<FolderEntity>
}