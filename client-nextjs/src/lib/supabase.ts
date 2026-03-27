import { createClient } from '@supabase/supabase-js'
import { CONGIG_ENV } from './env'

// Use service role key for business logic behind the scenes
export const supabaseAdmin = createClient(CONGIG_ENV.supabase.url, CONGIG_ENV.supabase.serviceRoleKey)


export const SUPABASE_EDGE_FUNCTION = {
    // lineBot: 'line-bot',
    lineBotNotify: 'line-bot-notify'
}