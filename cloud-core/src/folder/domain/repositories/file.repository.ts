import { UpdateFileDto } from "src/folder/dtos/update.file.dto";
import { FileEntity } from "../entities/file.entity";
import { CreateFileDto } from "src/folder/dtos/create.file.dto";

export interface IFileRepository {
    findByFolderId(folderId: string): Promise<FileEntity[]>;
    findById(id: string): Promise<FileEntity | null>;
    create(data: CreateFileDto): Promise<FileEntity>;
    createMany(data: CreateFileDto[]): Promise<{ count: number }>;
    update(id: string, data: UpdateFileDto): Promise<FileEntity>;
    delete(id: string): Promise<FileEntity>;
}