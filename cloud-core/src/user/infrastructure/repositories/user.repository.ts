import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { IUserRepository } from 'src/user/domain/repositories/user.repository';
import { CreateUserDto } from 'src/user/dtos/create.user.dto';
import { UpdateUserDto } from 'src/user/dtos/update.user.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prismaService: PrismaService) {}
  async findById(userId: string): Promise<UserEntity | null> {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }
  async create(data: CreateUserDto): Promise<UserEntity> {
    return this.prismaService.user.create({ data });
  }
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }
  async update(userId: string, data: UpdateUserDto): Promise<UserEntity> {
    return this.prismaService.user.update({
      where: { id: userId },
      data: data,
    });
  }

  async delete(userId: string): Promise<UserEntity> {
    return this.prismaService.user.delete({ where: { id: userId } });
  }
}
