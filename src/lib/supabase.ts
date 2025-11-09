import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wzqgozbmvzvbyogbrzyx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWdvemJtdnp2YnlvZ2Jyenl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkzNzgsImV4cCI6MjA3ODIyNTM3OH0.IXMyb8A9KT3hlEXNPr1HQZeYb_Sn0Zx7RADvc9U9EbM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
