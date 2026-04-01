// 舊的：import bcrypt from 'bcryptjs';
import { hash, compare, genSalt } from 'bcrypt-ts';

// ─── 雜湊密碼 ───
export async function hashPassword(password: string) {
    // Edge Runtime 建議手動處理 Salt 以確保非阻塞
    const salt = await genSalt(10);
    return await hash(password, salt);
}

// ─── 驗證密碼 ───
export async function verifyPassword(password: string, hash: string) {
    return await compare(password, hash);
}