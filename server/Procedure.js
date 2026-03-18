/**
 * 預約程序：儲存預約並同步更新快取
 * 
 * 1. 儲存原始預約資料到 booking 表
 * 2. 統計該時段的人數，更新或新增到 booking_cache 表
 * 
 * @param {Object} data 預約資料
 * @returns {Object} 執行結果
 */
function submitBooking(data) {
    // 1. 先解析資料 (如果是字串) 以取得 manager_uid
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
    }
    
    const managerUid = data.manager_uid || 'unknown';
    const lockKey = 'lock_mgr_' + managerUid;
    const projectLock = LockService.getScriptLock();
    const cache = CacheService.getScriptCache();
    let isLocked = false;
    
    try {
        // 2. 具名鎖定邏輯：當 manager_uid 一樣時才互斥
        // 透過全域鎖快速檢查並標記 Cache，實現分區並行
        const timeout = 30000;
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (projectLock.tryLock(500)) {
                try {
                    if (!cache.get(lockKey)) {
                        cache.put(lockKey, '1', 60); // 鎖定 60 秒防止掛掉不放
                        isLocked = true;
                        break;
                    }
                } finally {
                    projectLock.releaseLock();
                }
            }
            Utilities.sleep(Math.random() * 200 + 100);
        }

        if (!isLocked) throw new Error('伺服器忙碌中 (Manager Lock Timeout)');

        // 3. 儲存預約主表資料
        const insertBookingSql = `
            INSERT INTO booking (
                uid, manager_uid, name, line_uid, phone, 
                booking_start_time, booking_end_time, 
                service_item, service_computed_duration, 
                is_deposit_received, is_cancelled
            ) VALUES (
                '${data.uid}', 
                '${data.manager_uid}', 
                '${data.name}', 
                '${data.line_uid}', 
                '${data.phone}', 
                '${data.booking_start_time}', 
                '${data.booking_end_time}', 
                '${data.service_item}', 
                ${data.service_computed_duration || 60}, 
                ${data.is_deposit_received || false}, 
                false
            )
        `;
        Database.query(insertBookingSql);

        // 4. 更新預約快取表 (booking_cache)
        const startDate = new Date(data.booking_start_time.replace(/-/g, '/'));
        const endDate = new Date(data.booking_end_time.replace(/-/g, '/'));
        let currentSlot = new Date(startDate);
        currentSlot.setMinutes(0, 0, 0);

        const taskList = [];
        let currentIndex = 0;
        while (currentSlot <= endDate) {
            const slotStr = Utilities.formatDate(currentSlot, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
            const checkCacheSql = `
                SELECT uid, booked_count 
                FROM booking_cache 
                WHERE manager_uid = '${data.manager_uid}' 
                  AND booking_start_time = '${slotStr}'
            `;
            const value = Database.query(checkCacheSql);

            if (value && value.length > 0) {
                const record = value[0];
                const nextCount = (Number(record.booked_count) || 0) + 1;
                const max_capacity = data.max_capacity_array[currentIndex];
                if (nextCount > max_capacity) {
                    return { success: false, message: '該時段已滿' };
                }
            }
            taskList.push({ slot: slotStr, data: value });
            currentSlot.setMinutes(currentSlot.getMinutes() + data.time_slot_interval);
            currentIndex++;
        }

        taskList.forEach(task => {
            const value = task.data;
            if (value && value.length > 0) {
                const record = value[0];
                const nextCount = (Number(record.booked_count) || 0) + 1;
                Database.query(`UPDATE booking_cache SET booked_count = ${nextCount} WHERE uid = '${record.uid}'`);
            } else {
                const cacheUid = Utilities.getUuid();
                Database.query(`
                    INSERT INTO booking_cache (uid, manager_uid, booking_start_time, booked_count) 
                    VALUES ('${cacheUid}', '${data.manager_uid}', '${task.slot}', 1)
                `);
            }
        });

        return { success: true, message: '預約成功' };

    } catch (e) {
        logError(`submitBooking Procedure Error: ${e.message}`);
        return { success: false, error: '預約程序失敗: ' + e.message };
    } finally {
        // 5. 釋放具名鎖
        if (isLocked) cache.remove(lockKey);
    }
}
