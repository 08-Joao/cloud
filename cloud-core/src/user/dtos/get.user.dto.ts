export class GetUserDto {
    readonly id!: string;
    readonly name!: string;
    readonly email!: string;
    readonly generalFolderId?: string | null;
    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}