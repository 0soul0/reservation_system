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
            messages: [
                // 第一筆：文字訊息
                {
                    type: "text",
                    text: messages || ""
                },
                // 第二筆：Flex Message 物件

            ]
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



//預約歷史紀錄
//我要預約
const createBookingHistoryFlex = (rawBookings) => {
    // 1. 資料清洗：將資料從 {"line_get_booking_history": { ... }} 提取出來
    const bookings = rawBookings?.map(item => item.line_get_booking_history) || [];

    if (bookings.length === 0) {
        return {
            "type": "flex", "alt_text": "您目前沒有預約紀錄。",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box", "layout": "vertical", "spacing": "md",
                    "contents": [
                        { "type": "text", "text": "查無預約紀錄", "weight": "bold", "size": "xl", "align": "center" },
                        { "type": "text", "text": "您目前沒有任何預約紀錄喔！", "wrap": true, "align": "center", "color": "#888888" }
                    ]
                },
                "footer": {
                    "type": "box", "layout": "vertical",
                    "contents": [{ "type": "button", "style": "primary", "color": "#1877F2", "action": { "type": "message", "label": "立即預約", "text": "我要預約" } }]
                }
            }
        };
    }

    const bubbles = bookings.map(b => {
        // 簡單格式化時間：將 2026-03-30T11:30:00+00:00 轉為較易讀的格式
        const formattedDate = b.booking_date.replace('T', ' ').substring(0, 16);

        // 根據狀態決定 Header 顏色
        const headerColor = b.status === '已取消' ? '#FF4B4B' : (b.status === '已完成' ? '#888888' : '#1877F2');
        const statusText = statusMap[String(b.status)] || b.status;
        return {
            "type": "bubble",
            "header": {
                "type": "box", "layout": "vertical",
                "backgroundColor": headerColor,
                "contents": [
                    { "type": "text", "text": `預約狀態：${statusText}`, "color": "#FFFFFF", "weight": "bold", "size": "md" }
                ]
            },
            "body": {
                "type": "box", "layout": "vertical", "spacing": "md",
                "contents": [
                    { "type": "box", "layout": "baseline", "spacing": "sm", "contents": [{ "type": "text", "text": "時間", "color": "#aaaaaa", "size": "sm", "flex": 2 }, { "type": "text", "text": formattedDate, "wrap": true, "color": "#666666", "size": "sm", "flex": 5 }] },
                    { "type": "box", "layout": "baseline", "spacing": "sm", "contents": [{ "type": "text", "text": "服務", "color": "#aaaaaa", "size": "sm", "flex": 2 }, { "type": "text", "text": b.service_name, "wrap": true, "color": "#666666", "size": "sm", "flex": 5 }] },
                    { "type": "box", "layout": "baseline", "spacing": "sm", "contents": [{ "type": "text", "text": "來源", "color": "#aaaaaa", "size": "sm", "flex": 2 }, { "type": "text", "text": b.source_table === 'current' ? '近期預約' : '歷史紀錄', "wrap": true, "color": "#666666", "size": "sm", "flex": 5 }] }
                ]
            }
        };
    });

    return {
        "type": "flex",
        "altText": `您有 ${bookings.length} 筆預約紀錄。`,
        "contents": { "type": "carousel", "contents": bubbles }
    };
}


//取得預約資料(可以取消資料)
// 取消預約 Flex Message 生成器
function createBookingFlex_(rawBookings) {
    // 1. 資料解構：提取出內層的 JSON 物件
    const bookings = rawBookings?.map(item => item.line_get_booking_history) || [];

    // 2. 過濾邏輯：通常「取消預約」清單只需要顯示 status = 1 (預約中) 且 source_table = 'current' 的項目
    const cancellableBookings = bookings.filter(b => String(b.status) === '1');

    if (!cancellableBookings || cancellableBookings.length === 0) {
        return {
            "type": "flex", "altText": "您目前沒有可取消的預約。",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box", "layout": "vertical", "spacing": "md", "contents": [
                        { "type": "text", "text": "查無可取消的預約", "weight": "bold", "size": "xl", "align": "center" },
                        { "type": "text", "text": "您目前沒有任何可以取消的預約喔！", "wrap": true, "align": "center", "color": "#888888", "margin": "md" }
                    ]
                }
            }
        };
    }

    const bubbles = cancellableBookings.map(b => {
        // 格式化日期顯示
        const formattedDate = b.booking_date ? b.booking_date.replace('T', ' ').substring(0, 16) : '未知時間';

        return {
            "type": "bubble",
            "header": {
                "type": "box",
                "layout": "vertical",
                "backgroundColor": "#D9534F", // 警告紅
                "contents": [
                    { "type": "text", "text": "選擇取消這筆預約", "color": "#FFFFFF", "weight": "bold", "size": "md" }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "contents": [
                    {
                        "type": "box", "layout": "baseline", "spacing": "sm", "contents": [
                            { "type": "text", "text": "時間", "color": "#aaaaaa", "size": "sm", "flex": 2 },
                            { "type": "text", "text": formattedDate, "wrap": true, "color": "#666666", "size": "sm", "flex": 5 }
                        ]
                    },
                    {
                        "type": "box", "layout": "baseline", "spacing": "sm", "contents": [
                            { "type": "text", "text": "服務", "color": "#aaaaaa", "size": "sm", "flex": 2 },
                            { "type": "text", "text": b.service_name || "未提供", "wrap": true, "color": "#666666", "size": "sm", "flex": 5 }
                        ]
                    },
                    {
                        "type": "box", "layout": "baseline", "spacing": "sm", "contents": [
                            { "type": "text", "text": "單號", "color": "#aaaaaa", "size": "sm", "flex": 2 },
                            { "type": "text", "text": b.uid, "wrap": true, "color": "#888888", "size": "xs", "flex": 5 }
                        ]
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "style": "primary",
                        "color": "#D9534F",
                        "height": "sm",
                        "action": {
                            "type": "message",
                            "label": "確認取消這筆",
                            // 這裡發送的文字必須符合你後端處理取消的 RegExp 或邏輯
                            "text": `取消預約 ${b.uid}`
                        }
                    }
                ]
            }
        };
    });

    return {
        "type": "flex",
        "altText": "請選擇您要取消的預約",
        "contents": {
            "type": "carousel",
            "contents": bubbles
        }
    };
}


//還需要其他服務嗎
function createQuickActionsFlex_() {
    return {
        "type": "flex",
        "altText": "需要其他服務嗎？這裡有幾個常用功能供您選擇。",
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    { "type": "text", "text": "需要其他服務嗎？", "weight": "bold", "size": "lg", "margin": "md" },
                    { "type": "text", "text": "這裡有幾個常用功能供您選擇：", "size": "sm", "color": "#666666", "wrap": true, "margin": "md" }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                    { "type": "button", "style": "link", "height": "sm", "action": { "type": "message", "label": "查詢預約紀錄", "text": "預約紀錄" } },
                    { "type": "button", "style": "link", "height": "sm", "action": { "type": "message", "label": "我想要取消預約", "text": "取消預約" } }
                ],
                "flex": 0
            }
        }
    };
}


// 1. 定義 Map，Key 使用字串
const statusMap: Record<string, string> = {
    '1': '預約中',
    '2': '完成',
    '0': '取消預約'
};

