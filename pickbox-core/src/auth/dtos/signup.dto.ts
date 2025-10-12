import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Min } from "class-validator";
import { CreateUserDto } from "src/user/dtos/create.user.dto";

export class SignUpDto extends CreateUserDto{
    
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    readonly confirmPassword: string
}