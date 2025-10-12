import { IsNotEmpty, IsString } from "class-validator";

export class CreateFolderDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string
}