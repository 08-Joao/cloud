import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { FolderService } from 'src/folder/application/services/folder.service';
import { CreateFolderDto } from 'src/folder/dtos/create.folder.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dtos/create.user.dto';
import { UpdateUserDto } from 'src/user/dtos/update.user.dto';
import { UserMapper } from 'src/user/infrastructure/mappers/user.mapper';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository, 
        private prismaService: PrismaService, 
        @Inject(forwardRef(() => FolderService)) private folderService: FolderService
    ) {}

    async findById(userId: string) {
        return await this.userRepository.findById(userId);
    }

    async findByEmail(email: string) {
        return await this.userRepository.findByEmail(email);
    }

    async create(data: CreateUserDto) {
        return this.prismaService.$transaction(async (tx) => {
            const user = await this.userRepository.create(data);

            const createFolderData = {
                name: 'General',
            } as CreateFolderDto

            const generalFolder = await this.folderService.createFolder(user.id, createFolderData)

            await tx.user.update({
                where: { id: user.id },
                data: { generalFolderId: generalFolder.id }
            })

            return UserMapper.toGetUserDto(user);
        })
        
    }

    async update(userId: string, data: UpdateUserDto){
        return await this.userRepository.update(userId,data);
    }

    async delete(userId: string){
        return await this.userRepository.delete(userId);
    }
}
