import { Injectable } from "@nestjs/common";
import { FolderEntity } from "src/folder/domain/entities/folder.entity";
import { IFolderRepository } from "src/folder/domain/repositories/folder.repository";
import { CreateFolderDto } from "src/folder/dtos/create.folder.dto";
import { UpdateFolderDto } from "src/folder/dtos/update.folder.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FolderRepository implements IFolderRepository {
    constructor(private prismaService: PrismaService) {}
    async findById(id: string): Promise<FolderEntity | null> {
        return this.prismaService.folder.findUnique({ where: { id } });
    }

    async findByUserId(userId: string): Promise<FolderEntity[]> {
        return this.prismaService.folder.findMany({ where: { userFolders: { some: { userId } } } });
    }
    async create(data: CreateFolderDto): Promise<FolderEntity>{
        return this.prismaService.folder.create({ data });
    }

    async update(folderId: string, data: UpdateFolderDto): Promise<FolderEntity> {
        return this.prismaService.folder.update({ where: { id: folderId }, data });
    }

    async delete(folderId: string): Promise<FolderEntity> {
        return this.prismaService.folder.delete({ where: { id: folderId } });
    }
}