import { SignUpDto } from "src/auth/dtos/signup.dto";
import { UpdateAuthDto } from "src/auth/dtos/update.dto";
import { CreateUserDto } from "src/user/dtos/create.user.dto";

export class AuthMapper { 
    static toCreateUserDto(data: SignUpDto): CreateUserDto {
        return {
            name: data.name,
            email: data.email,
            password: data.password
        }
    }

    static toUpdateUserDto(data: SignUpDto | UpdateAuthDto): CreateUserDto {
        return {
            name: data.name,
            email: data.email,
            password: data.password
        }
    }
}