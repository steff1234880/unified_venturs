import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'

import type { Database } from './supabase.types'

const PLACEHOLDER_MARKERS = ['your-project', 'your-anon-key', 'placeholder']

function isPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase()
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))
}

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl.length > 0 &&
    env.supabaseAnonKey.length > 0 &&
    !isPlaceholderValue(env.supabaseUrl) &&
    !isPlaceholderValue(env.supabaseAnonKey),
)

let supabaseInstance: SupabaseClient<Database> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      env.supabaseUrl || 'https://placeholder.supabase.co',
      env.supabaseAnonKey || 'placeholder',
      {
        auth: {
          persistSession: isSupabaseConfigured,
          autoRefreshToken: isSupabaseConfigured,
          detectSessionInUrl: isSupabaseConfigured,
          storageKey: isSupabaseConfigured
            ? 'sb-intereor-auth-token'
            : 'sb-intereor-local-auth-token',
        },
      },
    )
  }

  return supabaseInstance
}

export const supabase = getSupabaseClient()

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    )
  }
}
