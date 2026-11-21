import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'

import { isLocalAdminMode } from '@/admin/auth/mode'
import { getLocalSession } from '@/admin/auth/local-auth.service'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

import { login as loginRequest, logout as logoutRequest } from './auth.service'

type AuthContextValue = {
  session: Session | null
  userEmail: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isLocalMode: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUserEmail: (newEmail: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const isLocalMode = isLocalAdminMode()
  const [session, setSession] = useState<Session | null>(null)
  const [localEmail, setLocalEmail] = useState<string | null>(() =>
    isLocalMode ? getLocalSession()?.email ?? null : null,
  )
  const [isLoading, setIsLoading] = useState(() =>
    isLocalAdminMode() ? false : isSupabaseConfigured,
  )

  useEffect(() => {
    if (isLocalMode || !isSupabaseConfigured) {
      return
    }

    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isLocalMode])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password)

    if (isLocalAdminMode() && 'email' in result) {
      setLocalEmail(result.email)
      setSession(null)
      return
    }

    setSession(result as Session)
    setLocalEmail(null)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setSession(null)
    setLocalEmail(null)
  }, [])

  const updateUserEmail = useCallback((newEmail: string) => {
    setLocalEmail(newEmail)
  }, [])

  const value = useMemo(
    () => ({
      session,
      userEmail: session?.user.email ?? localEmail,
      isAuthenticated: session !== null || localEmail !== null,
      isLoading,
      isLocalMode,
      login,
      logout,
      updateUserEmail,
    }),
    [session, localEmail, isLoading, isLocalMode, login, logout, updateUserEmail],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
