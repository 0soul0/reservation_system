/**
 * LINE 訊息服務 (Supabase Edge Function / Deno 版本)
 */
export const LineService = {
    /**
     * 回覆訊息 (Reply Message)
     */
    reply: async function (accessToken: string, replyToken: string, messages: any) {
        if (!accessToken || !replyToken) return;

        const payload = {
            replyToken: replyToken,
            messages: Array.isArray(messages) ? messages : [{ type: "text", text: messages }],
        };

        // 將 UrlFetchApp.fetch 改為標準 fetch
        const response = await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        return response.ok;
    },

    /**
     * 主動推播訊息 (Push Message)
     */
    push: async function (accessToken: string, lineUid: string, messages: any) {
        if (!lineUid || !accessToken) return;

        const payload = {
            to: lineUid,
            messages: Array.isArray(messages) ? messages : [{ type: "text", text: messages }],
        };

        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        return response.ok;
    },
};