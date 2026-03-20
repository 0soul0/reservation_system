import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 簡易 SQL 條件解析器 (針對現有專案常用的 WHERE 子句)
 * 轉化為 Supabase 查詢對象的過濾器
 */
function applyFilters(query: any, where?: string) {
    if (!where) return query;

    let filterPart = where;

    // 處理 LIMIT
    const limitMatch = filterPart.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
        const limitValue = parseInt(limitMatch[1], 10);
        query = query.limit(limitValue);
        // 去除 LIMIT 部分
        filterPart = filterPart.replace(/LIMIT\s+\d+/i, '').trim();
    }

    // 處理 ORDER BY
    const orderByMatch = filterPart.match(/ORDER BY ([\w\d_]+) (ASC|DESC)/i);
    if (orderByMatch) {
        const [, field, direction] = orderByMatch;
        query = query.order(field, { ascending: direction.toUpperCase() === 'ASC' });
        // 去除 ORDER BY 部分
        filterPart = filterPart.split(/ORDER BY/i)[0].trim();
    }

    // 處理多個 AND
    const conditions = filterPart.split(/\s+AND\s+/i);
    conditions.forEach(cond => {
        const eqMatch = cond.match(/([\w\d_]+)\s*=\s*['"]?([^'"]+)['"]?/);
        const neMatch = cond.match(/([\w\d_]+)\s*<>\s*['"]?([^'"]+)['"]?/);
        const inMatch = cond.match(/([\w\d_]+)\s+IN\s*\(([^)]+)\)/i);

        if (eqMatch) {
            const [, col, val] = eqMatch;
            query = query.eq(col, val === 'true' ? true : val === 'false' ? false : val);
        } else if (neMatch) {
            const [, col, val] = neMatch;
            query = query.neq(col, val === 'true' ? true : val === 'false' ? false : val);
        } else if (inMatch) {
            const [, col, valsString] = inMatch;
            const vals = valsString.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
            query = query.in(col, vals);
        }
    });

    return query;
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { action, table, data, where, procedure, params } = payload;

        if (action === 'select' && table) {
            let query = supabase.from(table).select('*');
            query = applyFilters(query, where);
            const { data: resData, error } = await query;
            if (error) throw error;
            return NextResponse.json({ status: 'success', data: resData });
        }

        if (action === 'insert' && table) {
            const { data: resData, error } = await supabase.from(table).insert(data).select();
            if (error) throw error;
            return NextResponse.json({ status: 'success', data: resData });
        }

        if (action === 'update' && table) {
            let query = supabase.from(table).update(data);
            query = applyFilters(query, where);
            const { data: resData, error } = await query.select();
            if (error) throw error;
            return NextResponse.json({ status: 'success', data: resData });
        }

        if (action === 'delete' && table) {
            let query = supabase.from(table).delete();
            query = applyFilters(query, where);
            const { error } = await query;
            if (error) throw error;
            return NextResponse.json({ status: 'success', message: '刪除成功' });
        }

        if (action === 'call' && procedure) {
            // 接橋特殊程序 (Procedure.js 的邏輯)
            if (procedure === 'submitBooking') {
                return await handle_submitBooking(params[0]);
            }
            if (procedure === 'cancelBooking') {
                return await handle_cancelBooking(params[0], params[1], params[2]);
            }
            if (procedure === 'getManagerScheduleConfig') {
                return await handle_getManagerScheduleConfig(params[0]);
            }
            if (procedure === 'saveScheduleConfig') {
                return await handle_saveScheduleConfig(params[0]);
            }
            if (procedure === 'getMemberEventInfo') {
                return await handle_getMemberEventInfo(params[0], params[1], params[2], params[3]);
            }

            // 如果是 Supabase 內置的 RPC
            const { data: resData, error } = await supabase.rpc(procedure, params);
            if (error) throw error;
            return NextResponse.json({ status: 'success', data: resData });
        }

        return NextResponse.json({ status: 'fail', message: '未支援的 action' }, { status: 400 });

    } catch (e: any) {
        console.error('API 錯誤:', e);
        return NextResponse.json({ status: 'fail', message: e.message }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// 接橋自 Procedure.js 的原始商業邏輯
// --------------------------------------------------------------------------------

async function handle_submitBooking(data: any) {
    // 1. 插入 Booking
    const { error: insertError } = await supabase.from('booking').insert({
        uid: data.uid,
        manager_uid: data.manager_uid,
        name: data.name,
        line_uid: data.line_uid,
        phone: data.phone,
        booking_start_time: data.booking_start_time,
        booking_end_time: data.booking_end_time,
        service_item: data.service_item,
        service_computed_duration: data.service_computed_duration || 60,
        is_deposit_received: data.is_deposit_received || false,
        is_cancelled: false
    });
    if (insertError) throw insertError;

    // 2. 更新 Booking Cache
    // 由於 Supabase 本身是真正的 DB，通常不需要像 Sheets 那樣手動維護 Counter
    // 但為了保持現狀，我們繼續維護 booking_cache 表
    const startDate = new Date(data.booking_start_time.replace(/-/g, '/'));
    const endDate = new Date(data.booking_end_time.replace(/-/g, '/'));
    let currentSlot = new Date(startDate);
    currentSlot.setMinutes(0, 0, 0);

    while (currentSlot <= endDate) {
        const slotStr = currentSlot.toISOString(); // 或保持 yyyy-MM-dd HH:mm 格式
        
        // 取得該時段
        const { data: cacheRec } = await supabase
            .from('booking_cache')
            .select('*')
            .eq('manager_uid', data.manager_uid)
            .eq('booking_start_time', slotStr)
            .single();

        if (cacheRec) {
            await supabase
                .from('booking_cache')
                .update({ booked_count: (cacheRec.booked_count || 0) + 1 })
                .eq('uid', cacheRec.uid);
        } else {
            await supabase.from('booking_cache').insert({
                uid: crypto.randomUUID(),
                manager_uid: data.manager_uid,
                booking_start_time: slotStr,
                booked_count: 1
            });
        }
        currentSlot.setMinutes(currentSlot.getMinutes() + data.time_slot_interval);
    }

    return NextResponse.json({ status: 'success', message: '預約成功' });
}

async function handle_cancelBooking(bookingUid: string, time_slot_interval: number, deleteType: number) {
    // 1. 讀取
    const { data: booking, error: fetchErr } = await supabase
        .from('booking')
        .select('*')
        .eq('uid', bookingUid)
        .single();
    if (fetchErr || !booking) throw new Error('找不到預約資料');

    // 2. 更新/刪除
    if (deleteType === 0) {
        await supabase.from('booking').delete().eq('uid', bookingUid);
    } else {
        await supabase.from('booking').update({ is_cancelled: true }).eq('uid', bookingUid);
    }

    // 3. 更新 Cache
    const startDate = new Date(booking.booking_start_time);
    const endDate = new Date(booking.booking_end_time);
    let currentSlot = new Date(startDate);
    currentSlot.setMinutes(0, 0, 0);

    while (currentSlot <= endDate) {
        const slotStr = currentSlot.toISOString();
        const { data: cacheRec } = await supabase
            .from('booking_cache')
            .select('*')
            .eq('manager_uid', booking.manager_uid)
            .eq('booking_start_time', slotStr)
            .single();

        if (cacheRec) {
            const newCount = (cacheRec.booked_count || 1) - 1;
            if (newCount <= 0) {
                await supabase.from('booking_cache').delete().eq('uid', cacheRec.uid);
            } else {
                await supabase.from('booking_cache').update({ booked_count: newCount }).eq('uid', cacheRec.uid);
            }
        }
        currentSlot.setMinutes(currentSlot.getMinutes() + time_slot_interval);
    }

    return NextResponse.json({ status: 'success', message: '取消成功' });
}

async function handle_getManagerScheduleConfig(managerUid: string) {
    const { data: menus } = await supabase
        .from('schedule_menu')
        .select('*')
        .eq('manager_uid', managerUid)
        .order('create_at', { ascending: false });

    let times = [];
    if (menus && menus.length > 0) {
        const { data: timesData } = await supabase
            .from('schedule_time')
            .select('*')
            .eq('schedule_menu_uid', menus[0].uid)
            .order('day_of_week', { ascending: true });
        times = timesData || [];
    }

    return NextResponse.json({ status: 'success', data: { menus: menus || [], times } });
}

async function handle_saveScheduleConfig(configString: string) {
    const config = JSON.parse(configString);
    const { menu, times, deleted_time_uids } = config;
    
    // 1. Upsert menu
    const { error: menuErr } = await supabase.from('schedule_menu').upsert({
        uid: menu.uid,
        manager_uid: menu.manager_uid,
        name: menu.name,
        update_at: new Date().toISOString()
    });
    if (menuErr) throw menuErr;

    // 2. Delete removed times
    if (deleted_time_uids && deleted_time_uids.length > 0) {
        await supabase.from('schedule_time').delete().in('uid', deleted_time_uids);
    }

    // 3. Upsert times
    if (times && times.length > 0) {
        const finalTimes = times.map((t: any) => ({
            ...t,
            manager_uid: menu.manager_uid,
            schedule_menu_uid: menu.uid,
            uid: t.uid || crypto.randomUUID()
        }));
        const { error: timeErr } = await supabase.from('schedule_time').upsert(finalTimes);
        if (timeErr) throw timeErr;
    }

    return NextResponse.json({ status: 'success', data: { success: true } });
}

async function handle_getMemberEventInfo(lineUid: string, bookingDynamicUrl: string, websiteName: string, scheduleMenuUid: string) {
    // 取得活動資料 (Dynamic URL 可能包含斜線，這裡需要精確匹配或使用原始邏輯)
    // 原本是 `/${manager?.website_name}/${eventState.booking_dynamic_url}`
    // 在 Booking.tsx 傳過來的是 `booking_dynamic_url` 從 slug 組合回來的
    
    const { data: eventRecords } = await supabase
        .from('event')
        .select('*')
        .eq('website_name', websiteName)
        .eq('booking_dynamic_url', bookingDynamicUrl);

    if (!eventRecords || eventRecords.length === 0) {
        return NextResponse.json({ status: 'success', data: { is_member: true, msg: '找不到活動' } });
    }

    const eventData = eventRecords[0];
    let isMember = false;

    if (lineUid) {
        const { data: member, error: memberErr } = await supabase
            .from('member')
            .select('uid')
            .eq('line_uid', lineUid)
            .maybeSingle(); // 使用 maybeSingle 避免找不到時噴錯
        
        if (member) isMember = true;
    }

    if (isMember || !lineUid) {
        // 如果是會員或不是從 LINE 進來 (例如網址直接開啟)，返回預約所需資料
        const [overrides, times, caches] = await Promise.all([
            supabase.from('schedule_override').select('*').eq('schedule_menu_uid', scheduleMenuUid || ''),
            supabase.from('schedule_time').select('*').eq('schedule_menu_uid', scheduleMenuUid || ''),
            supabase.from('booking_cache').select('*').eq('manager_uid', eventData.manager_uid)
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                is_member: true,
                event: eventData,
                schedule_override: overrides.data || [],
                schedule_time: times.data || [],
                booking_cache: caches.data || []
            }
        });
    } else {
        // 如果不是會員且有 Line UID，需要導向註冊，先回傳經裡人設定的問卷
        const { data: manager } = await supabase
            .from('manager')
            .select('questionnaire')
            .eq('uid', eventData.manager_uid)
            .maybeSingle();

        return NextResponse.json({
            status: 'success',
            data: {
                is_member: false,
                event: eventData,
                questionnaire: manager?.questionnaire || null
            }
        });
    }
}
