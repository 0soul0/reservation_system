/**
 * 產生顧客預約提醒的 Flex Message (修復 URI 錯誤並加入地址)
 */
function getCustomerReminderFlex(title, color, bk, day, note) {
  // 1. 設定基礎資訊 (請務必確保這裡是以 https:// 開頭)
  const rawParkingUrl = "https://www.google.com/maps/search/?api=1&query=停車場"; 
  const rawStoreUrl = "https://www.google.com/maps/search/?api=1&query=HNP健甲專家";
  const STORE_ADDRESS = "台北市大安區某某路 123 號 1 樓"; // 👈 這裡顯示文字地址

  // 2. 重要：對 URI 進行編碼，防止 "invalid uri" 錯誤
  const PARKING_URL = encodeURI(rawParkingUrl);
  const STORE_URL = encodeURI(rawStoreUrl);

  // 3. 格式化時間
  const timeStr = Utilities.formatDate(new Date(bk.booking_start_time), "GMT+8", "MM/dd HH:mm");

  return {
    type: "flex",
    altText: title,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: color,
        contents: [{ type: "text", text: title, color: "#ffffff", weight: "bold", size: "lg" }]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: `親愛的 ${bk.name} 您好：溫馨提醒您，${day}有服務預約喔！`, wrap: true },
          { 
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              { type: "text", text: `🗓️ 時間：${timeStr}`, size: "sm" },
              { type: "text", text: `🛠️ 服務：${bk.service_item}`, size: "sm", wrap: true },
              { type: "text", text: `📍 地址：${STORE_ADDRESS}`, size: "sm", color: "#1E90FF", wrap: true }
            ]
          },
          { type: "separator" },
          { type: "text", text: note, size: "xs", color: "#aaaaaa", wrap: true }
        ]
      },
      footer: {
        type: "box",
        layout: "horizontal",
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "🅿️ 停車導航",
              uri: PARKING_URL // 👈 已經過 encodeURI 處理
            },
            style: "primary",
            color: "#4e73df"
          },
          {
            type: "button",
            action: {
              type: "uri",
              label: "📍 店家位置",
              uri: STORE_URL // 👈 已經過 encodeURI 處理
            },
            style: "primary",
            color: "#1cc88a"
          }
        ]
      }
    }
  };
}

/**
 * 管理員摘要卡片 (Carousel 內的 Bubble)
 */
/**
 * 產生管理員摘要卡片 (Carousel 內的單個 Bubble)
 * 所有文字與樣式設定皆已內含，方便維護。
 */
function createDigestBubble(dateStr, apps) {
  // --- 內部設定區 (方便隨時修改文字與顏色) ---
  const CONFIG = {
    BG_COLOR: "#27406C",       // 標題區背景顏色
    SUCCESS_LABEL: "已付",      // 定金已付文字
    PENDING_LABEL: "未付",      // 定金未付文字
    SUCCESS_COLOR: "#00bb00",  // 已付文字顏色 (綠)
    PENDING_COLOR: "#ff0000",  // 未付文字顏色 (紅)
    NO_BOOKING_TEXT: "本日目前無預約 🌴" // 當天沒人預約時顯示
  };

  // 1. 處理預約清單 rows
  const rows = apps.length > 0 ? apps.map(a => {
    return {
      type: "box",
      layout: "horizontal",
      contents: [
        { 
          type: "text", 
          text: Utilities.formatDate(new Date(a.booking_start_time), "GMT+8", "HH:mm"), 
          size: "xs", 
          flex: 2  // 時間比例
        },
        { 
          type: "text", 
          text: a.is_deposit_received ? CONFIG.SUCCESS_LABEL : CONFIG.PENDING_LABEL, 
          color: a.is_deposit_received ? CONFIG.SUCCESS_COLOR : CONFIG.PENDING_COLOR, 
          size: "xs", 
          flex: 2  // 狀態比例 (必須為整數，不可用 1.5)
        },
        { 
          type: "text", 
          text: a.name || "無姓名", 
          size: "xs", 
          flex: 4, // 姓名比例，給較寬空間
          wrap: true 
        }
      ]
    };
  }) : [
    { 
      type: "text", 
      text: CONFIG.NO_BOOKING_TEXT, 
      align: "center", 
      color: "#aaaaaa", 
      size: "sm", 
      margin: "md" 
    }
  ];

  // 2. 組裝並回傳 Bubble 物件
  return {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: CONFIG.BG_COLOR,
      contents: [
        { 
          type: "text", 
          text: `${dateStr} (${apps.length} 筆)`, 
          color: "#ffffff", 
          weight: "bold", 
          size: "sm" 
        }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: rows
    }
  };
}