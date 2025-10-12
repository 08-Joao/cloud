import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class SignInDto {
    @IsEmail()
    readonly email: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    readonly password: string;
}