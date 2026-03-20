
import { nanoid } from 'nanoid'
/**
 * 產生唯一識別碼 (UID)
 * 格式: [Prefix][Timestamp][Random String]
 * 例如: SM1710312540000a1b2
 */
export function generateUid(prev: String = ""): string {
    return prev + nanoid(10);
}
