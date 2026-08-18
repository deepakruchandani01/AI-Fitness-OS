import { createClient } from "@supabase/supabase-js";
/** SERVER ONLY. Bypasses RLS. Used solely by trusted server code (Apple Health webhook). */
export function createAdminClient() {
  if (typeof window !== "undefined") throw new Error("Admin client cannot run in the browser");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
