import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = 'Asia/Taipei';

export const TimeUtils = {
    /**
     * 只取日期部分 (YYYY-MM-DD)
     */
    getDatePart(date: Date | string | number = new Date()): string {
        return dayjs(date).tz(DEFAULT_TIMEZONE).format('YYYY-MM-DD');
    },

    /**
     * 只取時間部分 (HH:mm:ss)
     */
    getTimePart(date: Date | string | number = new Date()): string {
        return dayjs(date).tz(DEFAULT_TIMEZONE).format('HH:mm');
    },

    /**
   * 轉為帶時區的字串 (Format: 2025-10-30T09:00:00+08:00)
   * 用於傳送給 Google Calendar API 或後端
   */
    getDateTime(date: Date | string | number = new Date(), tz = DEFAULT_TIMEZONE): string {
        return dayjs(date).tz(tz).format('YYYY-MM-DD HH:mm');
    },


    /**
     * 合併日期與時間，並輸出帶時區的 ISO 字串
     * @param datePart 格式如 "2025-10-30"
     * @param timePart 格式如 "09:00" 或 "09:00:00"
     */
    combineDateTime(datePart: string, timePart: string, tz = DEFAULT_TIMEZONE): string {
        // 組合後解析，並指定時區
        const combined = dayjs.tz(`${datePart} ${timePart}`, tz);
        return combined.format('YYYY-MM-DDTHH:mm:ssZ');
    },

    /**
   * 轉為帶時區的字串 (Format: 2025-10-30T09:00:00+08:00)
   * 用於傳送給 Google Calendar API 或後端
   */
    toZoneString(date: Date | string | number = new Date(), tz = DEFAULT_TIMEZONE): string {
        return dayjs(date).tz(tz).format('YYYY-MM-DDTHH:mm:ssZ');
    },

    toUTC(date: Date | string | number = new Date()): string {
        return dayjs(date).utc().format();
    },

    /**
      * 取得格式化的時間範圍
      * 範例輸出: "2026-03-27 09:01 ~ 11:00"
      */
    formatRange(start: Date | string, end: Date | string): string {
        const startDateTime = this.getDateTime(start)
        const endTime = this.getTimePart(end)

        return `${startDateTime} ~ ${endTime}`;
    },

    /**
     * 取得格式化的時間範圍
     * 範例輸出: "09:01 ~ 11:00"
     */
    formatTimeRange(start: Date | string, end: Date | string): string {
        const startTime = this.getTimePart(start)
        const endTime = this.getTimePart(end)

        return `${startTime} ~ ${endTime}`;
    }
};