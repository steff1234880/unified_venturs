import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { isLocalAdminMode } from '@/admin/auth/mode'
import { isSupabaseConfigured } from '@/lib/supabase'

import { useAuth } from './AuthProvider'

function AuthLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory-50">
      <p className="text-body-md text-muted-foreground">Loading...</p>
    </div>
  )
}

function SupabaseNotConfigured() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory-50 p-6">
      <div className="max-w-md rounded-xl border border-border bg-surface-elevated p-8 text-center shadow-sm">
        <h1 className="text-heading-md text-charcoal-900">Supabase not configured</h1>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Add <code className="text-teak-700">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-teak-700">VITE_SUPABASE_ANON_KEY</code> to your{' '}
          <code className="text-teak-700">.env</code> file, then run the SQL migration in{' '}
          <code className="text-teak-700">supabase/migrations/</code>.
        </p>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured && !isLocalAdminMode()) {
    return <SupabaseNotConfigured />
  }

  if (isLoading) {
    return <AuthLoading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isSupabaseConfigured && !isLocalAdminMode()) {
    return <SupabaseNotConfigured />
  }

  if (isLoading) {
    return <AuthLoading />
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
