import {
  localLogin,
  localLogout,
  getLocalSession,
  type LocalAdminSession,
} from '@/admin/auth/local-auth.service'

export async function getSession(): Promise<LocalAdminSession | null> {
  return getLocalSession()
}

export async function login(
  email: string,
  password: string,
): Promise<LocalAdminSession> {
  return localLogin(email, password)
}

export async function logout(): Promise<void> {
  await localLogout()
}
