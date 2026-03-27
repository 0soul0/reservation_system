/**
 * 集中管理系統內的所有路由路徑
 */
export const ROUTES = {
  // 公開路徑
  LOGIN: '/login',
  
  // 管理後台路徑
  ADMIN: {
    HOME: '/admin/members', // 預設進後台跳轉路徑
    MEMBERS: '/admin/members',
    BOOKINGS: '/admin/bookings',
    
    // 時程管理
    SCHEDULES: '/admin/schedules',
    SCHEDULE_EDIT: (id: string) => `/admin/schedules/${id}`,
    
    // 事件管理
    EVENTS: '/admin/events',
    EVENT_NEW: '/admin/events/new',
    EVENT_EDIT: (id: string) => `/admin/events/${id}`,
  }
} as const;

// 用於 server action / revalidatePath 的路徑模式
export const PATH_PATTERNS = {
  ADMIN_SCHEDULE_DETAIL: '/admin/schedules/[id]',
} as const;
