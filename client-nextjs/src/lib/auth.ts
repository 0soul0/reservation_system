import bcrypt from 'bcryptjs';

// 設定加密強度 (Round)，通常 10 是平衡效能與安全的最佳選擇
const SALT_ROUNDS = 10;

/**
 * 加密密碼 (註冊時使用)
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 驗證密碼 (登入時使用)
 * @param password 使用者輸入的明文
 * @param hashedPassword 資料庫存儲的加密字串
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};