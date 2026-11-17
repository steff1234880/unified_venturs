import { isSupabaseConfigured } from '@/lib/supabase'

/** Use browser localStorage admin when Supabase credentials are missing. */
export function isLocalAdminMode() {
  return !isSupabaseConfigured
}
