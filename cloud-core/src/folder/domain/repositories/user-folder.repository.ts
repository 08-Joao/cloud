import { CreateUserFolderDto } from "src/folder/dtos/create.user-folder.dto"
import { UserFolderEntity } from "../entities/user-folder.entity"

export interface IUserFolderRepository {
    findById(id: number): Promise<UserFolderEntity | null>
    findByUserId(userId: string): Promise<UserFolderEntity[]>
    findByFolderAndUserId(folderId: string, userId: string): Promise<UserFolderEntity | null>
    create(data: CreateUserFolderDto): Promise<UserFolderEntity>
    update(id: number, data: Partial<CreateUserFolderDto>): Promise<UserFolderEntity>
    delete(id: number): Promise<UserFolderEntity>
    deleteByFolderId(folderId: string): Promise<{ count: number }>
}