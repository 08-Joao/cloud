import { IsNotEmpty, IsString } from "class-validator";

export class UpdateFileDto {
    @IsString()
    @IsNotEmpty()
    readonly filename: string;

    @IsNotEmpty()
    readonly isPublic: boolean;

    @IsString()
    @IsNotEmpty()
    readonly ownerId: string; 

    @IsString()
    @IsNotEmpty()
    readonly folderId: string;
}