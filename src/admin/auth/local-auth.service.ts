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

  // Authenticate against backend API backed by SQLite admin_users table
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password }),
  })

  if (res.ok) {
    const data = await res.json()
    if (data.success && data.user) {
      const session: LocalAdminSession = {
        email: data.user.email,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      return session
    }
  }

  const errData = await res.json().catch(() => ({}))
  throw new Error(errData.error || 'Invalid email or password.')
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
