import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { getLocalSession } from '@/admin/auth/local-auth.service'
import { login as loginRequest, logout as logoutRequest } from './auth.service'
import { apiUrl } from '@/lib/api-url'

type AuthContextValue = {
  session: null
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
  const [localEmail, setLocalEmail] = useState<string | null>(() => getLocalSession()?.email ?? null)
  const [isLoading] = useState(false)

  // Verify backend session on mount using /api/auth/profile
  useEffect(() => {
    let mounted = true
    const session = getLocalSession()
    if (session?.email) {
      fetch(apiUrl('/api/auth/profile'))
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (mounted && data?.user?.email) {
            setLocalEmail(data.user.email)
          }
        })
        .catch(() => {})
    }
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password)
    if (result && 'email' in result) {
      setLocalEmail(result.email)
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setLocalEmail(null)
  }, [])

  const updateUserEmail = useCallback((newEmail: string) => {
    setLocalEmail(newEmail)
  }, [])

  const value = useMemo(
    () => ({
      session: null,
      userEmail: localEmail,
      isAuthenticated: localEmail !== null,
      isLoading,
      isLocalMode: true,
      login,
      logout,
      updateUserEmail,
    }),
    [localEmail, isLoading, login, logout, updateUserEmail],
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
