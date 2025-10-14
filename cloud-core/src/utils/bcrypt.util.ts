import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 12;
export async function hashPassword (password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}


export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
} 