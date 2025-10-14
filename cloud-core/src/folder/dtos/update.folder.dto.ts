import { IsNotEmpty, IsString } from "class-validator";

export class UpdateFolderDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string
}