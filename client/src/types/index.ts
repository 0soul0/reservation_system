// ─────────────────────────────────────────────────────────────────────────────
// Shared domain types for the Admin panel
// ─────────────────────────────────────────────────────────────────────────────

// ── Member ────────────────────────────────────────────────────────────────────

export type Member = {
    uid: string;
    name: string;
    line_uid: string;
    phone: number;
    email: string;
    questionnaire: string;
    create_at: string;
    update_at: string;
    status: number; // 0 = 休眠, 1 = 活躍
};

// ── Event ─────────────────────────────────────────────────────────────────────

export type EventData = {
    uid: string;
    manager_uid: string;
    title: string;
    description: string;
    is_phone_required: boolean;
    is_email_required: boolean;
    schedule_menu_uid: string;
    booking_dynamic_url: string;
    create_at: string;
    update_at: string;
    options: string; // JSON string: {"name": "Category", "items": [{"title": "Item", "duration": 60}]}
};

// ── Schedule ──────────────────────────────────────────────────────────────────

export type ScheduleMenu = {
    uid: string;
    manager_uid: string;
    name: string;
    create_at: string;
    update_at: string;
};

export type ScheduleTimeRow = {
    uid: string;
    schedule_menu_uid: string;
    time_range: string;
    day_of_week: number; // 1=週一 … 7=週日
    max_capacity: number;
    is_open: boolean;
    is_open_last_booking_time: boolean;
    last_booking_time: string;
    create_at: string;
    update_at: string;
};

export type ScheduleMenuWithTimes = ScheduleMenu & {
    times: ScheduleTimeRow[];
};

export type ScheduleOverride = {
    uid: string;
    schedule_menu_uid: string;
    override_time: string;
    override_date: string;
    max_capacity: number;
    is_closed: boolean;
    create_at: string;
    update_at: string;
};
