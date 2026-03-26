import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for business logic behind the scenes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)


export const SUPABASE_EDGE_FUNCTION = {
    // lineBot: 'line-bot',
    lineBotNotify: 'line-bot-notify'
}