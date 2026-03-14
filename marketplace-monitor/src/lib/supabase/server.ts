import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseClient(useServiceRole = false) {
  const key = useServiceRole && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey;
  return createClient<Database>(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Server-side: usa service role para bypass RLS; autorização por user_id é feita na aplicação (Auth.js). */
export function getSupabaseServer() {
  return createSupabaseClient(!!supabaseServiceKey);
}

/** Use apenas em server-side para scraper/cron (bypass RLS quando necessário) */
export function getSupabaseService() {
  return createSupabaseClient(true);
}
