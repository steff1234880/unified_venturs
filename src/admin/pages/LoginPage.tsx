import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, FormField, Input } from '@/components/ui'
import { Logo } from '@/components/common'
import { env } from '@/config/env'
import { isLocalAdminMode } from '@/admin/auth/mode'
import { useAuth } from '@/admin/auth/AuthProvider'

export function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(() => (isLocalAdminMode() ? env.adminEmail : ''))
  const [password, setPassword] = useState(() => (isLocalAdminMode() ? env.adminPassword : ''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from =
    (location.state as { from?: string } | null)?.from ?? '/admin'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh">
      <div className="hidden flex-1 bg-charcoal-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Logo size="lg" variant="light" />
          <p className="mt-3 text-overline text-gold-400">Administration</p>
        </div>
        <p className="max-w-md text-body-lg text-ivory-100/70">
          Secure content management for your luxury interior brand.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-ivory-50 p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Logo size="md" className="lg:hidden" />
          <h1 className="mt-4 text-heading-lg text-charcoal-900">Sign in</h1>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>

          {isLocalAdminMode() && (
            <p
              onClick={() => {
                setEmail(env.adminEmail)
                setPassword(env.adminPassword)
              }}
              className="mt-4 rounded-md border border-gold-400/30 bg-gold-50/70 px-3.5 py-2.5 sm:px-4 sm:py-3 text-body-sm text-charcoal-800 break-words cursor-pointer hover:bg-gold-100/60 transition-colors"
              title="Click to auto-fill dev credentials"
            >
              Local dev mode — use{' '}
              <strong className="break-all">{env.adminEmail}</strong> / <strong>{env.adminPassword}</strong>{' '}
              <span className="text-xs text-gold-700 block mt-0.5">(Click to auto-fill)</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField id="admin-email" label="Email" required>
              <Input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </FormField>

            <FormField id="admin-password" label="Password" required>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </FormField>

            {error && (
              <p className="text-body-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
