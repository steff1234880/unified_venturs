import type { Session } from '@supabase/supabase-js'

import { isLocalAdminMode } from '@/admin/auth/mode'
import {
  localLogin,
  localLogout,
  type LocalAdminSession,
} from '@/admin/auth/local-auth.service'
import { assertSupabaseConfigured, supabase } from '@/lib/supabase'

export async function getSession(): Promise<Session | null> {
  if (isLocalAdminMode()) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

export async function login(
  email: string,
  password: string,
): Promise<Session | LocalAdminSession> {
  if (isLocalAdminMode()) {
    return localLogin(email, password)
  }

  assertSupabaseConfigured()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.session) {
    throw new Error('Login failed. Please try again.')
  }

  return data.session
}

export async function logout(): Promise<void> {
  if (isLocalAdminMode()) {
    await localLogout()
    return
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
