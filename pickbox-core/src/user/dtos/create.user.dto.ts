import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Min } from "class-validator";
import { SignInDto } from "src/auth/dtos/signin.dto";

export class CreateUserDto extends SignInDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}