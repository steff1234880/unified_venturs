import { env } from '@/config/env'

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
  await new Promise((resolve) => setTimeout(resolve, 300))

  const validEmail = email.trim().toLowerCase() === env.adminEmail.toLowerCase()
  const validPassword = password === env.adminPassword

  if (!validEmail || !validPassword) {
    throw new Error('Invalid email or password.')
  }

  const session: LocalAdminSession = {
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return session
}

export async function localLogout(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY)
}
