import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  async getOrCreate(data: CreateUserDto) {
    if (!data.id || !data.email || !data.name) {
      throw new Error('Dados de usuário incompletos');
    }


    try {
      // 1. Verifica se usuário já existe
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: data.id },
        include: { rootFolder: true },
      });

      if (existingUser) {

        // Apenas atualiza dados básicos
        const updatedUser = await this.prismaService.user.update({
          where: { id: data.id },
          data: {
            email: data.email,
            name: data.name,
          },
          include: { rootFolder: true },
        });

        return updatedUser;
      }

      // 2. Usuário não existe, cria TUDO em uma transação

      const user = await this.prismaService.$transaction(async (tx) => {
        // Passo 1: Cria o usuário
        const newUser = await tx.user.create({
          data: {
            id: data.id,
            email: data.email,
            name: data.name,
          },
        });


        // Passo 2: Cria a pasta raiz
        const rootFolder = await tx.folder.create({
          data: {
            name: 'Meus Arquivos',
            ownerId: newUser.id,
          },
        });

        // Passo 3: Vincula pasta raiz ao usuário
        const userWithFolder = await tx.user.update({
          where: { id: newUser.id },
          data: {
            rootFolderId: rootFolder.id,
          },
          include: {
            rootFolder: true,
          },
        });

        return userWithFolder;
      });

      return user;
    } catch (error) {
      // Se falhar em qualquer ponto, TUDO é revertido

      throw error;
    }
  }

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async updateStorageUsed(
    id: string,
    bytes: number,
    operation: 'increment' | 'decrement',
  ) {
    return this.prismaService.user.update({
      where: { id },
      data: { storageUsed: { [operation]: bytes } },
    });
  }

  async hasStorageSpace(userId: string, requiredBytes: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageQuota: true },
    });

    if (!user) {
      return false;
    }

    return user.storageUsed + requiredBytes <= user.storageQuota;
  }

  async remove(id: string) {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
