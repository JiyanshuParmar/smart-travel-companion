import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

export function createClient() {
  return createBrowserClient(
    "https://yltbhywhcscchharfwoj.supabase.co",
    "sb_publishable_SKgg4SMwUcC9GfyxqY9uMA_mnr-ydCU"
  );
}