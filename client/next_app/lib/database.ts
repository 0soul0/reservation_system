// 將原本 callGasApi 的請求導向 Next.js API Route
const API_URL = "/api/database";

export interface GasPayload {
    action: "select" | "insert" | "update" | "delete" | "call";
    table?: string;
    data?: any | any[];
    sql?: string;
    where?: string;
    procedure?: string;
    params?: any[];
}

export interface GasResponse<T = any> {
    status: "success" | "fail";
    message?: string;
    data?: T;
}

/**
 * 核心 API 呼叫函式 (Next.js 橋接版)
 */
export async function callGasApi<T = any>(payload: GasPayload): Promise<T | null> {
    try {
        console.log("Supabase API Payload: ", payload);
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: GasResponse<T> = await response.json();
        console.log("Supabase API Result: ", result);
        
        if (result.status === "fail") {
            console.error("API 錯誤:", result.message);
            return null;
        }

        return result.data ?? null;
    } catch (error) {
        console.error("網路或系統錯誤:", error);
        return null;
    }
}
