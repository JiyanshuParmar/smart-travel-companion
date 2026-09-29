import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "SUPABASE_PUBLISHABLE_KEY";

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}