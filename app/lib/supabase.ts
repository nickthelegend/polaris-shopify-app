import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://fiybwytbjinqznreerlu.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || ""; // Should be Service Role Key for server-side

export const supabase = createClient(supabaseUrl, supabaseKey);
