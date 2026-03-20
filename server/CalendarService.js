/**
 * Google 日曆整合服務
 */
const CalendarService = {

    /**
     * 取得管理員的日曆 ID
     */
    getCalendarId: function (managerUid) {
        const mgr = Database.query(`SELECT google_calendar_id FROM manager WHERE uid = '${managerUid}'`);
        if (mgr && mgr.length > 0) return mgr[0].google_calendar_id;
        return null;
    },

    /**
     * 建立日曆行程
     * const eventId = CalendarService.createEvent(data.manager_uid, data);
     */
    createEvent: function (managerUid, bookingData) {
        const calId = this.getCalendarId(managerUid);
        if (!calId) return null;

        const calendar = CalendarApp.getCalendarById(calId);
        if (!calendar) return null;

        const startTime = new Date(bookingData.booking_start_time.replace(/-/g, '/'));
        const endTime = new Date(bookingData.booking_end_time.replace(/-/g, '/'));
        const title = `預約: ${bookingData.name} - ${bookingData.service_item}`;
        const description = `電話: ${bookingData.phone}\nLINE UID: ${bookingData.line_uid || '未提供'}`;

        const event = calendar.createEvent(title, startTime, endTime, {
            description: description,
            location: 'Reservation System'
        });

        return event.getId();
    },

    /**
     * 更新日曆行程 (若時間或標題變更時)
     */
    updateEvent: function (managerUid, eventId, updatedData) {
        const calId = this.getCalendarId(managerUid);
        if (!calId || !eventId) return;

        const calendar = CalendarApp.getCalendarById(calId);
        const event = calendar.getEventById(eventId);
        if (!event) return;

        if (updatedData.booking_start_time && updatedData.booking_end_time) {
            const start = new Date(updatedData.booking_start_time.replace(/-/g, '/'));
            const end = new Date(updatedData.booking_end_time.replace(/-/g, '/'));
            event.setTime(start, end);
        }

        if (updatedData.name || updatedData.service_item) {
            event.setTitle(`預約: ${updatedData.name || '客戶'} - ${updatedData.service_item || '服務'}`);
        }
    },

    /**
     * 刪除日曆行程
     */
    deleteEvent: function (managerUid, eventId) {
        const calId = this.getCalendarId(managerUid);
        if (!calId || !eventId) return;

        const calendar = CalendarApp.getCalendarById(calId);
        const event = calendar.getEventById(eventId);
        if (event) event.deleteEvent();
    }
};
