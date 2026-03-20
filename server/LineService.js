/**
 * LINE 訊息服務 (LINE Messaging API)
 */
const LineService = {

    /**
     * 取得管理員的 LINE Access Token
     */
    getToken: function(managerUid) {
        const mgr = Database.query(`SELECT line_channel_access_token FROM manager WHERE uid = '${managerUid}'`);
        if (mgr && mgr.length > 0) return mgr[0].line_channel_access_token;
        return null;
    },

    /**
     * 回覆訊息 (Reply Message)
     */
    reply: function(managerUid, replyToken, messages) {
        const token = this.getToken(managerUid);
        if (!token) return;

        const payload = {
            replyToken: replyToken,
            messages: Array.isArray(messages) ? messages : [{ type: 'text', text: messages }]
        };

        UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            payload: JSON.stringify(payload)
        });
    },

    /**
     * 主動推播訊息 (Push Message)
     */
    push: function(managerUid, lineUid, messages) {
        if (!lineUid) return;
        const token = this.getToken(managerUid);
        if (!token) return;

        const payload = {
            to: lineUid,
            messages: Array.isArray(messages) ? messages : [{ type: 'text', text: messages }]
        };

        UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            payload: JSON.stringify(payload)
        });
    },

    /**
     * 處理 Webhook 事件
     * 這裡可根據 event.type 與 message.text 決定回覆邏輯
     */
    handleWebhook: function(event, managerUid) {
        if (event.type === 'message') {
            const replyToken = event.replyToken;
            const userMsg = event.message.text;
            
            // 範例回覆：可以串接 AI 或自定義規則
            this.reply(managerUid, replyToken, `收到您的訊息了！您剛剛說：${userMsg}`);
        }
    }
};
