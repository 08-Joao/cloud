import { IsNotEmpty, IsString } from "class-validator";

export class CreateFileDto {
    @IsString()
    @IsNotEmpty()
    readonly filename: string;

    @IsString()
    @IsNotEmpty()
    readonly originalName: string;

    @IsString()
    @IsNotEmpty()
    readonly mimeType: string;

    @IsNotEmpty()
    readonly size: number;

    @IsString()
    @IsNotEmpty()
    readonly path: string;

    @IsNotEmpty()
    readonly isPublic: boolean;

    @IsString()
    @IsNotEmpty()
    readonly ownerId: string; 

    @IsString()
    @IsNotEmpty()
    readonly folderId: string;
}