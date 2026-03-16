/**
 * 處理網頁應用程式的 GET 請求
 */
function doGet(e) {
    const query = e.parameter.query;
    logInfo(`GET request: ${query}`);
    if (!query) {
        return createJsonResponse({ success: false, error: '缺少 query 參數' });
    }

    const result = Database.query(query);
    logInfo(`GET response: ${JSON.stringify(result)}`);
    return createJsonResponse(result);
}

/**
 * 處理網頁應用程式的 POST 請求
 */
function doPost(e) {
    try {
        const postData = JSON.parse(e.postData.contents);
        const query = postData.query;
        logInfo(`POST request: ${query}`);
        if (!query) {
            return createJsonResponse({ success: false, error: 'JSON 中缺少 query 欄位' });
        }

        const result = Database.query(query);
        logInfo(`POST response: ${JSON.stringify(result)}`);
        return createJsonResponse(result);

    } catch (error) {
        return createJsonResponse({ success: false, error: '解析請求失敗: ' + error.message });
    }
}

/**
 * 輔助函數：建立標準 JSON 回傳格式
 * @param {any} input Database.query 的原始回傳結果
 */
function createJsonResponse(input) {
    const response = {
        status: 'success',
        message: '',
        data: null
    };

    if (input && typeof input === 'object') {
        if (input.success === false) {
            response.status = 'fail';
            response.message = input.error || '不明錯誤';
        } else if (input.success === true) {
            const { success, message, ...rest } = input;
            response.data = Object.keys(rest).length > 0 ? rest : null;
        } else {
            response.data = input;
        }
    } else {
        response.data = input;
    }

    return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}
