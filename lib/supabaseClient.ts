import { createClient } from '@supabase/supabase-js';

// Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);
