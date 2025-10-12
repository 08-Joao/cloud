import { CreateUserDto } from "src/user/dtos/create.user.dto";
import { UserEntity } from "../entities/user.entity";

export interface IUserRepository {
    findById(userId: string): Promise<UserEntity | null>;
    create(data: CreateUserDto): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    update(userId: string, data: Partial<UserEntity>): Promise<UserEntity>;
    delete(userId: string): Promise<UserEntity>;
}