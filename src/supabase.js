import { createClient } from "@supabase/supabase-js";

const env = typeof import.meta !== "undefined" ? import.meta.env : undefined;

const supabaseUrl =
  env?.VITE_SUPABASE_URL || "https://pfmyadttbapefgnotrsh.supabase.co";
const supabaseKey =
  env?.VITE_SUPABASE_ANON_KEY ||
  env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_uZarUFI_zmyGGmUsdHJSCw_C6TRHyD8";

export const supabase = createClient(supabaseUrl, supabaseKey);
