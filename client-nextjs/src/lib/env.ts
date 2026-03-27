export const CONGIG_ENV = {
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    google: {
        gasUrl: process.env.NEXT_PUBLIC_GAS_URL!,
    },
    services: {
        lineNotifyEdge: process.env.NEXT_PUBLIC_EDGE_FUNCTION!,
    }
} as const;