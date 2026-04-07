// 兩天前提醒 (cronSendTwoDaysReminders)
function cronSendTwoDaysReminders() {
  const target = new Date();
  target.setDate(target.getDate() + 2);
  const dateStr = Utilities.formatDate(target, "GMT+8", "yyyy-MM-dd");

  // 篩選：預約成功(status=2)、未取消、未傳送過 2天提醒、日期為後天
  const list = supabaseRequest('get', `booking?select=*,manager(*)&status=eq.2&is_reminded_3d=eq.false&booking_start_time=gte.${dateStr}T00:00:00&booking_start_time=lte.${dateStr}T23:59:59`);
  
  list.forEach(bk => {
    const flex = getCustomerReminderFlex("📅 預約提醒", "#28a745", bk, "後天", "期待您的光臨～若需更改或取消，請盡快與我們聯繫！取消改約『不』影響定金扣除。");
    
    sendPush(bk.manager.line_channel_access_token, bk.line_uid, flex);
    supabaseRequest('patch', `booking?uid=eq.${bk.uid}`, { is_reminded_3d: true });
  });
}

// 明天提醒 (cronSendTomorrowReminders)
function cronSendTomorrowReminders() {
  const target = new Date();
  target.setDate(target.getDate() + 1);
  const dateStr = Utilities.formatDate(target, "GMT+8", "yyyy-MM-dd");

  const list = supabaseRequest('get', `booking?select=*,manager(*)&status=eq.2&is_reminded_1d=eq.false&booking_start_time=gte.${dateStr}T00:00:00&booking_start_time=lte.${dateStr}T23:59:59`);

  list.forEach(bk => {
    const flex = getCustomerReminderFlex("📅 明日預約提醒", "#960f0f", bk, "明天", "48小時內取消改約，定金將會沒收扣除喔！敬請體諒🥹");
    sendPush(bk.manager.line_channel_access_token, bk.line_uid, flex);
    supabaseRequest('patch', `booking?uid=eq.${bk.uid}`, { is_reminded_1d: true });
  });
}

// ③ 定金催繳提醒 (每小時執行)
function cronRemindDeposits() {
  const now = new Date();
  // 篩選：未收定金、非取消狀態
  const list = supabaseRequest('get', `booking?select=*,manager(*)&is_deposit_received=eq.false&status=neq.3`);

  list.forEach(bk => {
    const start = new Date(bk.booking_start_time);
    const diff = (start - now) / (1000 * 60 * 60);

    // 距離預約前 48 小時內且未標記已催繳 (需在 booking 增加 is_deposit_reminded 欄位)
    if (diff <= 48 && diff > 0 && !bk.is_deposit_reminded) {
      
      const msg = `📣 定金提醒\n親愛的 ${bk.name} 您好：\n服務：${bk.service_item}\n您的預約將在 ${Math.floor(diff)} 小時內開始，請盡快完成定金繳納。\n\n💰 定金金額：NT$300\n🏦 匯款資訊：${bk.manager.bank_name}\n📄 戶名：${bk.manager.bank_account_owner}\n🔢 帳號：${bk.manager.bank_account}\n\n⏰ 最晚請於 24 小時內完成匯款，並回覆「末五碼」以便對帳。`;

      console.log("bk,",bk.line_uid)
      sendPush(bk.manager.line_channel_access_token, bk.line_uid, { type: "text", text: msg });
      supabaseRequest('patch', `booking?uid=eq.${bk.uid}`, { is_deposit_reminded: true });
    }
  });
}

// 管理員通知與摘要
// ⑥ 每日預約摘要 (週三、週日 09:00)
function cronDailyDigest() {
  const managers = supabaseRequest('get', 'manager');
  managers.forEach(m => {
    let bubbles = [];
    const days = [1, 2, 3]; // 明、後、大後天
    
    days.forEach(dOffset => {
      const date = new Date();
      date.setDate(date.getDate() + dOffset);
      const ds = Utilities.formatDate(date, "GMT+8", "yyyy-MM-dd");
      const apps = supabaseRequest('get', `booking?manager_uid=eq.${m.uid}&booking_start_time=gte.${ds}T00:00:00&booking_start_time=lte.${ds}T23:59:59&status=neq.3&order=booking_start_time.asc`);
      bubbles.push(createDigestBubble(ds, apps));
    });
    
    sendPush(m.line_channel_access_token, "2008062990", {
      type: "flex", altText: "預約摘要", contents: { type: "carousel", contents: bubbles }
    });
  });
}