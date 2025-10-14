import { IsStrongPassword } from "class-validator";
import { SignUpDto } from "./signup.dto";

export class UpdateAuthDto extends SignUpDto {
    @IsStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
    readonly oldPassword: string
}