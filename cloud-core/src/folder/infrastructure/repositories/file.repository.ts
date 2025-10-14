import { Injectable } from "@nestjs/common";
import { FileEntity } from "src/folder/domain/entities/file.entity";
import { IFileRepository } from "src/folder/domain/repositories/file.repository";
import { CreateFileDto } from "src/folder/dtos/create.file.dto";
import { UpdateFileDto } from "src/folder/dtos/update.file.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FileRepository implements IFileRepository {
    constructor(private prismaService: PrismaService) {}

    async findByFolderId(folderId: string): Promise<FileEntity[]> {
        return this.prismaService.file.findMany({ where: { folderId } });
    }

    async findById(id: string): Promise<FileEntity | null> {
        return this.prismaService.file.findUnique({ where: { id } });
    }

    async create(data: CreateFileDto): Promise<FileEntity> {
        return this.prismaService.file.create({ data });
    }

    async createMany(data: CreateFileDto[]): Promise<{ count: number }> {
        return this.prismaService.file.createMany({ data });
    }

    async update(id: string, data: UpdateFileDto): Promise<FileEntity> { 
        return this.prismaService.file.update({ where: { id }, data });
    }

    async delete(id: string): Promise<FileEntity> {
        return this.prismaService.file.delete({ where: { id } });
    }

}