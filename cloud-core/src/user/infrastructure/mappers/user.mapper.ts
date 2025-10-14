import { GetUserDto } from "src/user/dtos/get.user.dto";

export class UserMapper {
    static toGetUserDto(user: any): GetUserDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}