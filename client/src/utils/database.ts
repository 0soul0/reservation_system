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

export interface DBResult {
    success: boolean;
    message?: string;
    data?: any;
}

/**
 * 執行非查詢類 SQL (如 INSERT, UPDATE, DELETE, CALL)
 */
export async function executeNonQuery(sql: string): Promise<DBResult> {
    try {
        const response = await fetch(DATABASE_URL, {
            method: 'POST',
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

        // 優先讀取業務邏輯的回傳結構 (圖片中的 result.data.result)
        if (result.status === 'success' && result.data?.result) {
            return {
                success: result.data.result.success,
                message: result.data.result.message || '',
                data: result.data
            };
        }

        return {
            success: result.status === 'success',
            message: result.message || '',
            data: result.data
        };
    } catch (error: any) {
        console.error('NonQuery Error:', error);
        return {
            success: false,
            message: error.message || 'Unknown error occurred'
        };
    }
}

