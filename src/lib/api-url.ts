import { env } from '@/config/env'

/**
 * Returns the fully qualified API URL given a relative API path.
 * In production static hosting, resolves against env.apiUrl (https://unified-venturs-mzut.onrender.com).
 * In development, uses relative /api to work with Vite dev proxy or the configured API URL.
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const base = (env.apiUrl || '').trim().replace(/\/+$/, '')
  return base ? `${base}${cleanPath}` : cleanPath
}
