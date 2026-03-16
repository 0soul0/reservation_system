/**
 * 建立完整關連性的測試假資料
 * 包含：Manager, Member, BusinessHours, Event, ScheduleOverride, Booking
 */
function seedAllData() {
    console.log('🚀 開始插入完整關聯測試資料...');

    // 1. 定義常數 ID 以利關連
    const MGR_ID = 'MGR_001';
    const BH_ID_WEEKDAY = 'BH_WEEKDAY';
    const BH_ID_WEEKEND = 'BH_WEEKEND';

    // 2. 清除舊資料
    clearAllData();

    // 3. 建立管理者 (Manager) - 定義問卷結構
    const questDef = [
        {
            title: "身體評估",
            options: [{ title: "正常" }, { title: "過敏" }, { title: "肌肉緊繃" }, { title: "受傷中" }]
        },
        {
            title: "偏好力道",
            options: [{ title: "強" }, { title: "中" }, { title: "輕" }]
        }
    ];

    Database.query(`INSERT INTO manager (
        uid, account, password, logo_url, website_name, bank_name, bank_account, bank_account_owner, questionnaire
    ) VALUES (
        '${MGR_ID}', 'admin', 'admin', 'hnp.png', '靜心紓壓館', '國泰世華', '123-456-789', '陳大志', '${JSON.stringify(questDef).replace(/'/g, "''")}'
    )`);
    console.log('✅ Manager 插入完成');

    // 4. 建立預約活動 (Event) - options 包含群組名稱與選項清單
    const event1Options = {
        name: '專業按摩服務',
        items: [
            { title: '瑞典式油壓', duration: 60 },
            { title: '深層筋膜放鬆', duration: 90 },
            { title: '精油穴道按摩', duration: 60 }
        ]
    };

    const event2Options = {
        name: '美容護理服務',
        items: [
            { title: '煥采臉部護理', duration: 45 },
            { title: '保濕深層清粉刺', duration: 60 }
        ]
    };

    Database.query(`INSERT INTO event (
        uid, manager_uid, title, description, options, business_hours_ids, is_phone_required
    ) VALUES (
        'E_001', '${MGR_ID}', '身體放鬆專案', '專業手法解放疲勞', '${JSON.stringify(event1Options).replace(/'/g, "''")}', '${BH_ID_WEEKDAY}', 'true'
    )`);

    Database.query(`INSERT INTO event (
        uid, manager_uid, title, description, options, business_hours_ids, is_phone_required
    ) VALUES (
        'E_002', '${MGR_ID}', '臉部美顏專案', '精緻護理喚醒亮麗', '${JSON.stringify(event2Options).replace(/'/g, "''")}', '${BH_ID_WEEKEND}', 'true'
    )`);
    console.log('✅ Events 插入完成');

    // 5. 建立營業時間 (Business Hours)
    Database.query(`INSERT INTO business_hours (uid, manager_uid, day_of_week, time_range, max_capacity) VALUES ('${BH_ID_WEEKDAY}', '${MGR_ID}', '1,2,3,4,5', '10:00-20:00', '3')`);
    Database.query(`INSERT INTO business_hours (uid, manager_uid, day_of_week, time_range, max_capacity) VALUES ('${BH_ID_WEEKEND}', '${MGR_ID}', '6,0', '11:00-18:00', '2')`);
    console.log('✅ Business Hours 插入完成');

    // 6. 建立會員 (Member) - 更新至 member 表並回答問卷
    const members = [
        { uid: 'U_001', name: '王小華', luid: 'line_w_01', phone: '0912111222', email: 'wang@test.com', q: '正常,強' },
        { uid: 'U_002', name: '李阿美', luid: 'line_l_02', phone: '0922333444', email: 'lee@test.com', q: '肌肉緊繃,中' },
        { uid: 'U_003', name: '張大名', luid: 'line_z_03', phone: '0933555666', email: 'zhang@test.com', q: '過敏,輕' }
    ];
    members.forEach(m => {
        Database.query(`INSERT INTO member (uid, managerUid, name, line_uid, phone, email, questionnaire, status) VALUES ('${m.uid}', '${MGR_ID}', '${m.name}', '${m.luid}', '${m.phone}', '${m.email}', '${m.q}', '1')`);
    });
    console.log('✅ Members 插入完成');

    // 7. 建立預約記錄 (Booking)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = Utilities.formatDate(tomorrow, 'GMT+8', 'yyyy-MM-dd');

    const bookings = [
        { uid: 'B_001', member: members[0], service: '瑞典式油壓', start: '10:00', end: '11:00', deposit: 'true' },
        { uid: 'B_002', member: members[1], service: '深層筋膜放鬆', start: '14:00', end: '15:30', deposit: 'false' },
        { uid: 'B_003', member: members[2], service: '煥采臉部護理', start: '16:00', end: '16:45', deposit: 'true' }
    ];

    bookings.forEach(b => {
        Database.query(`INSERT INTO booking (
            uid, manager_uid, name, line_uid, phone, booking_start_time, booking_end_time, service_id, is_deposit_received, is_cancelled
        ) VALUES (
            '${b.uid}', '${MGR_ID}', '${b.member.name}', '${b.member.luid}', '${b.member.phone}', '${dateStr}T${b.start}:00', '${dateStr}T${b.end}:00', '${b.service}', '${b.deposit}', 'false'
        )`);
    });
    console.log('✅ Bookings 插入完成');

    // 8. 覆蓋日程 (Schedule Override)
    Database.query(`INSERT INTO schedule_override (uid, manager_uid, override_date, override_time, max_capacity) VALUES (
        'OV_001', '${MGR_ID}', '2026-05-01', '00:00-23:59', '0'
    )`);
    console.log('✅ Schedule Override 插入完成');

    console.log('✨ 測試資料插入作業全部結束！');
}

/**
 * 清空所有相關資料表
 */
function clearAllData() {
    const tables = ['manager', 'member', 'booking', 'business_hours', 'schedule_override', 'event', 'logs'];
    const ss = getSpreadsheetApp();
    tables.forEach(name => {
        const sheet = ss.getSheetByName(name);
        if (sheet && sheet.getLastRow() > 1) {
            sheet.deleteRows(2, sheet.getLastRow() - 1);
            console.log(`掃除中: 已清空表: ${name}`);
        }
    });
}
