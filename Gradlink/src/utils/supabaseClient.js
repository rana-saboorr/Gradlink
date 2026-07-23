import { createClient } from '@supabase/supabase-js';

// Fallbacks are provided so the app doesn't immediately crash if the user hasn't put the keys in yet.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
