import { Injectable } from '@nestjs/common';
import { CreateUserFolderDto } from 'src/folder/dtos/create.user-folder.dto';
import { UserFolderRepository } from 'src/folder/infrastructure/repositories/user-folder.repository';

@Injectable()
export class UserFolderService {
  constructor(private userFolderRepository: UserFolderRepository) {}

  async getUserFolders(userId: string) {
    return this.userFolderRepository.findByUserId(userId);
  }

  async getUserFolderByFolderIdAndUserId(folderId: string, userId: string) {
    return this.userFolderRepository.findByFolderAndUserId(folderId, userId);
  }

  async createUserFolder(data: CreateUserFolderDto) {
    return this.userFolderRepository.create(data);
  }

  async updateUserFolder(id: number, data: Partial<CreateUserFolderDto>) {
    return this.userFolderRepository.update(id, data);
  }
}
