/**
 * 建立完整關連性的測試假資料
 * 包含：Manager, Member, ScheduleMenu, ScheduleTimes, Event, ScheduleOverride, Booking
 */
function seedAllData() {
    console.log('🚀 開始插入完整關聯測試資料...');

    // 1. 定義常數與格式設定
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = Utilities.formatDate(tomorrow, 'GMT+8', 'yyyy-MM-dd');

    // 2. 清除舊資料
    clearAllData();

    // 3. 建立管理者 (Managers)
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
    const questStr = JSON.stringify(questDef).replace(/'/g, "''");

    const managers = [
        { uid: 'MGR_001', account: 'admin', name: '靜心紓壓館 (旗艦店)' },
        { uid: 'MGR_002', account: 'manager_b', name: '樂活美學中心 (二號店)' }
    ];

    managers.forEach(m => {
        Database.query(`INSERT INTO manager (
            uid, account, password, logo_url, website_name, bank_name, bank_account, bank_account_owner, questionnaire
        ) VALUES (
            '${m.uid}', '${m.account}', 'admin123', 'hnp.png', '${m.name}', '國泰世華', '123-456-789', '負責人', '${questStr}'
        )`);
    });
    console.log('✅ Managers 插入完成');

    // 4. 建立營業選單 (Schedule Menu)
    const menus = [
        { uid: 'MENU_001', mgr_uid: 'MGR_001', name: '旗艦店-正常營業' },
        { uid: 'MENU_002', mgr_uid: 'MGR_002', name: '二號店-全日營業' }
    ];
    menus.forEach(m => {
        Database.query(`INSERT INTO schedule_menu (uid, manager_uid, name) VALUES ('${m.uid}', '${m.mgr_uid}', '${m.name}')`);
    });
    console.log('✅ Schedule Menus 插入完成');

    // 5. 建立營業時段 (Schedule Times)
    const times = [
        // MGR_001 - 平日
        { uid: 'T_001', menu: 'MENU_001', day: '1,2,3,4,5', range: '10:00-20:00', max: '3' },
        // MGR_001 - 週末
        { uid: 'T_002', menu: 'MENU_001', day: '6,0', range: '11:00-18:00', max: '2' },
        // MGR_002 - 全天候
        { uid: 'T_003', menu: 'MENU_002', day: '1,2,3,4,5,6,0', range: '09:00-21:00', max: '5' }
    ];
    times.forEach(t => {
        Database.query(`INSERT INTO schedule_times (
            uid, schedule_menu_uid, day_of_week, time_range, max_capacity, is_open
        ) VALUES (
            '${t.uid}', '${t.menu}', '${t.day}', '${t.range}', '${t.max}', 'true'
        )`);
    });
    console.log('✅ Schedule Times 插入完成');

    // 6. 建立預約活動 (Event)
    const eventOptions = {
        name: '服務選單',
        items: [
            { title: '全身油壓放鬆', duration: 60 },
            { title: '深層肌肉修復', duration: 90 },
            { title: '足底經絡按摩', duration: 45 }
        ]
    };
    const optStr = JSON.stringify(eventOptions).replace(/'/g, "''");

    const events = [
        { uid: 'E_001', mgr: 'MGR_001', title: '頂級舒壓專案', menu: 'MENU_001' },
        { uid: 'E_002', mgr: 'MGR_002', title: '快速充電專案', menu: 'MENU_002' }
    ];
    events.forEach(e => {
        Database.query(`INSERT INTO event (
            uid, manager_uid, title, description, options, business_hours_ids, is_phone_required
        ) VALUES (
            '${e.uid}', '${e.mgr}', '${e.title}', '專業技師服務', '${optStr}', '${e.menu}', 'true'
        )`);
    });
    console.log('✅ Events 插入完成');

    // 7. 建立會員 (Member)
    const members = [
        { uid: 'U_001', mgr: 'MGR_001', name: '王小華', luid: 'line_w_01', phone: '0912111222' },
        { uid: 'U_002', mgr: 'MGR_001', name: '李阿美', luid: 'line_l_02', phone: '0922333444' },
        { uid: 'U_003', mgr: 'MGR_002', name: '張大名', luid: 'line_z_03', phone: '0933555666' }
    ];
    members.forEach(m => {
        Database.query(`INSERT INTO member (
            uid, manager_uid, name, line_uid, phone, email, questionnaire, status
        ) VALUES (
            '${m.uid}', '${m.mgr}', '${m.name}', '${m.luid}', '${m.phone}', 'user@example.com', '正常,強', '1'
        )`);
    });
    console.log('✅ Members 插入完成');

    // 8. 建立預約記錄 (Booking)
    const bookings = [
        { uid: 'B_001', mgr: 'MGR_001', member: members[0], start: '10:00', end: '11:00' },
        { uid: 'B_002', mgr: 'MGR_002', member: members[2], start: '14:00', end: '14:45' }
    ];
    bookings.forEach(b => {
        Database.query(`INSERT INTO booking (
            uid, manager_uid, name, line_uid, phone, booking_start_time, booking_end_time, service_id, is_deposit_received, is_cancelled
        ) VALUES (
            '${b.uid}', '${b.mgr}', '${b.member.name}', '${b.member.luid}', '${b.member.phone}', '${dateStr}T${b.start}:00', '${dateStr}T${b.end}:00', '全身油壓放鬆', 'true', 'false'
        )`);
    });
    console.log('✅ Bookings 插入完成');

    // 9. 覆蓋日程 (Schedule Override)
    Database.query(`INSERT INTO schedule_override (
        uid, schedule_menu_uid, override_date, override_time, max_capacity, is_closed
    ) VALUES (
        'OV_001', 'MENU_001', '2026-05-01', '00:00-23:59', '0', 'true'
    )`);
    console.log('✅ Schedule Override 插入完成');

    console.log('✨ 測試資料插入作業全部結束！');
}

/**
 * 清空所有相關資料表
 */
function clearAllData() {
    const tables = [
        'manager',
        'member',
        'booking',
        'schedule_times',
        'schedule_menu',
        'schedule_override',
        'event',
        'logs'
    ];
    const ss = getSpreadsheetApp();
    tables.forEach(name => {
        const sheet = ss.getSheetByName(name);
        if (sheet && sheet.getLastRow() > 1) {
            sheet.deleteRows(2, sheet.getLastRow() - 1);
            console.log(`掃除中: 已清空表: ${name}`);
        }
    });
}
