import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'example-anon-key'
);

export { supabase };
