const DATABASE_URL = import.meta.env.VITE_GAS_DATABASE_URL;

/**
 * 執行 SQL 查詢並傳回結果
 * Google Apps Script 執行成功應傳回 { status: 'success', data: [...] }
 * 執行失敗應傳回 { status: 'error', message: '...' }
 */
export async function executeSQL<T = any>(sql: string): Promise<T[]> {

    try {
        const response = await fetch(`${DATABASE_URL}?query=${encodeURIComponent(sql)}`, {
            method: 'GET',
            mode: 'cors', // 如果 GAS 有處理 CORS
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log("Fetch result:" + sql, result);
        if (result.status === 'success') {
            return result.data as T[];
        } else {
            throw new Error(result.message || 'Unknown Database Error');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}

/**
 * 執行非查詢類 SQL (如 INSERT, UPDATE, DELETE)
 */
export async function executeNonQuery(sql: string): Promise<boolean> {

    try {
        // 使用 POST 避免 URL 長度限制及更好的語義
        const response = await fetch(DATABASE_URL, {
            method: 'POST',
            // 由於 GAS 對 POST 的 Content-Type 處理限制，通常用 text/plain 傳遞 JSON
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ query: sql }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Fetch result:" + sql, result);
        return result.status === 'success';
    } catch (error) {
        console.error('NonQuery Error:', error);
        return false;
    }
}
