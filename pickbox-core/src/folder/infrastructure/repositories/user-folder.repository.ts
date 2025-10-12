import { Injectable } from "@nestjs/common";
import { UserFolderEntity } from "src/folder/domain/entities/user-folder.entity";
import { IUserFolderRepository } from "src/folder/domain/repositories/user-folder.repository";
import { CreateUserFolderDto } from "src/folder/dtos/create.user-folder.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserFolderRepository implements IUserFolderRepository {
    constructor(private prismaService: PrismaService) {}
    async findById(id: number): Promise<UserFolderEntity | null>{
        return this.prismaService.userFolder.findUnique({ where: { id } });
    }

    async findByUserId(userId: string): Promise<UserFolderEntity[]>{
        return this.prismaService.userFolder.findMany({ where: { userId } });
    }

    async findByFolderAndUserId(folderId: string, userId: string): Promise<UserFolderEntity | null> {
        return this.prismaService.userFolder.findFirst({ where: { folderId, userId } });
    }

    async create(data:CreateUserFolderDto): Promise<UserFolderEntity>{
        return this.prismaService.userFolder.create({ data });
    }

    async update(id: number, data: Partial<CreateUserFolderDto>): Promise<UserFolderEntity>{
        return this.prismaService.userFolder.update({ where: { id: id }, data });
    }

    async delete(id: number): Promise<UserFolderEntity>{
        return this.prismaService.userFolder.delete({ where: { id: id } });
    }

    async deleteByFolderId(folderId: string): Promise<{ count: number }> {
        return this.prismaService.userFolder.deleteMany({ where: { folderId } });
    }
}