import { UserFolderService } from './user-folder.service';
import { UserService } from '../../../user/application/services/user.service';
import { CreateFileDto } from 'src/folder/dtos/create.file.dto';
import { FileRepository } from '../../infrastructure/repositories/file.repository';
import { ForbiddenException, Injectable, NotFoundException, Inject, forwardRef, UnprocessableEntityException } from '@nestjs/common';
import { UpdateFileDto } from 'src/folder/dtos/update.file.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FolderService } from 'src/folder/application/services/folder.service';

@Injectable()
export class FileService {
    constructor(
        private fileRepository: FileRepository, 
        private prismaService: PrismaService, 
        private userFolderService: UserFolderService,
        @Inject(forwardRef(() => FolderService)) private folderService: FolderService, 
        @Inject(forwardRef(() => UserService)) private userService: UserService
    ) {}

    async getFileById(fileId: string) {
        return this.fileRepository.findById(fileId);
    }

    async createFile(data: CreateFileDto) {
        return this.fileRepository.create(data);
    }

    async createFiles(data: CreateFileDto[]) {
        return this.fileRepository.createMany(data);
    }

    async getFilePath(fileId: string) {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new UnprocessableEntityException('File not found');
        }
        return file.path;
    }

    async updateFile(userId: string, fileId: string, data: UpdateFileDto) {
        let editData = data;
        const file = await this.fileRepository.findById(fileId);

        if (!file) {
            throw new NotFoundException('File not found');
        }

        if(file.ownerId !== userId){
            throw new ForbiddenException('You do not have permission to update this file ownership');
        }

        // Changing file ownership
        if(file.ownerId !== data.ownerId){
            const userFolder = await this.userFolderService.getUserFolderByFolderIdAndUserId(file.folderId, data.ownerId);

            // That means the new owner does not have permission in the file's folder. So we MUST change this file to the new owner's general folder.
            if(!userFolder){
                const user = await this.userService.findById(data.ownerId)

                if(!user){
                    throw new NotFoundException('New owner not found')
                }

                if(!user.generalFolderId){
                    throw new NotFoundException('New owner does not have a general folder')
                }
                editData = {...data, folderId: user.generalFolderId}
            }
        }

        return this.fileRepository.update(fileId, editData);
    }

    async deleteFile(fileId: string) {
        return this.fileRepository.delete(fileId);
    }
}
