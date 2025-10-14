import bcrypt from "bcrypt";

const DEFAULT_COST = 12;
const SALT_ROUNDS = Number(process.env.BCRYPT_COST ?? DEFAULT_COST);

// At least 8 characters, at least 1 letter and 1 number
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}