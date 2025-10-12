import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { FolderRole } from "generated/prisma";

export class CreateUserFolderDto {
    @IsUUID()
    folderId: string;
    
    @IsUUID()
    userId: string;
    
    @IsString()
    @IsNotEmpty()
    userRole: FolderRole;
}