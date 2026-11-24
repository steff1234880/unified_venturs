const SESSION_KEY = 'intereor-admin-session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

export type LocalAdminSession = {
  email: string
  expiresAt: number
}

function parseSession(): LocalAdminSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(raw) as LocalAdminSession

    if (session.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }

    return session
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function getLocalSession(): LocalAdminSession | null {
  return parseSession()
}

export async function localLogin(email: string, password: string): Promise<LocalAdminSession> {
  const normalizedEmail = email.trim().toLowerCase()

  // 1. Try local server backend API authentication backed by SQLite admin_users table
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    })

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success && data.user) {
        const session: LocalAdminSession = {
          email: data.user.email,
          expiresAt: Date.now() + SESSION_DURATION_MS,
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
        return session
      }
      if (data.error) {
        throw new Error(data.error)
      }
    }
  } catch (err: any) {
    if (err instanceof Error && err.message !== 'Failed to fetch') {
      throw err
    }
  }

  // 2. Fallback check for static frontend deployments without an active Node server
  // Checks credentials saved locally in the browser's persistent store or rejects cleanly
  try {
    const rawStore = localStorage.getItem('intereor-admin-credentials')
    if (rawStore) {
      const creds = JSON.parse(rawStore)
      if (
        creds.email &&
        creds.password &&
        creds.email.toLowerCase() === normalizedEmail &&
        creds.password === password
      ) {
        const session: LocalAdminSession = {
          email: creds.email,
          expiresAt: Date.now() + SESSION_DURATION_MS,
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
        return session
      }
    }
  } catch {
    // ignore parse error
  }

  throw new Error('Invalid email or password.')
}

export async function updateLocalAdminSession(newEmail: string): Promise<void> {
  const current = getLocalSession()
  if (current) {
    const updated: LocalAdminSession = {
      ...current,
      email: newEmail.trim().toLowerCase(),
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
  }
}

export async function localLogout(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY)
}
