import { useState, useEffect, type FormEvent } from 'react'
import {
  HiOutlineUserCircle,
  HiOutlineKey,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi'

import { PageHeader } from '@/admin/components/PageHeader'
import { useAuth } from '@/admin/auth/AuthProvider'
import { updateLocalAdminSession } from '@/admin/auth/local-auth.service'
import { Button, FormField, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'

export function AdminAccountPage() {
  const { userEmail, isLocalMode, updateUserEmail } = useAuth()

  const [currentEmail, setCurrentEmail] = useState(userEmail || '')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch verified current email from backend
  useEffect(() => {
    let cancelled = false
    setFetching(true)

    if (isLocalMode) {
      fetch('/api/auth/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data?.user?.email) {
            setCurrentEmail(data.user.email)
            updateUserEmail(data.user.email)
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setFetching(false)
        })
    } else {
      if (userEmail) setCurrentEmail(userEmail)
      setFetching(false)
    }

    return () => {
      cancelled = true
    }
  }, [isLocalMode, userEmail, updateUserEmail])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // 1. Validation
    if (!currentPassword) {
      setError('Current password is required to verify your identity.')
      return
    }

    const trimmedNewEmail = newEmail.trim()
    const isEmailChanging = trimmedNewEmail && trimmedNewEmail.toLowerCase() !== currentEmail.toLowerCase()
    const isPasswordChanging = Boolean(newPassword)

    if (!isEmailChanging && !isPasswordChanging) {
      setError('Please provide a new email or new password to update.')
      return
    }

    if (isEmailChanging) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedNewEmail)) {
        setError('Please enter a valid email address.')
        return
      }
    }

    if (isPasswordChanging) {
      if (newPassword.length < 4) {
        setError('New password must be at least 4 characters long.')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match.')
        return
      }
      if (newPassword === currentPassword) {
        setError('New password must be different from current password.')
        return
      }
    }

    setLoading(true)

    try {
      if (isLocalMode) {
        // Local mode with SQLite persistence
        const response = await fetch('/api/admin/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword,
            newEmail: isEmailChanging ? trimmedNewEmail : undefined,
            newPassword: isPasswordChanging ? newPassword : undefined,
          }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update admin account credentials.')
        }

        const updatedEmail = data.user?.email || (isEmailChanging ? trimmedNewEmail : currentEmail)
        setCurrentEmail(updatedEmail)
        updateUserEmail(updatedEmail)
        await updateLocalAdminSession(updatedEmail)

        // Reset sensitive inputs
        setNewEmail('')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        setSuccess(data.message || 'Admin account credentials updated successfully.')
      } else {
        // Supabase mode
        if (isPasswordChanging) {
          const { error: pwError } = await supabase.auth.updateUser({ password: newPassword })
          if (pwError) throw new Error(pwError.message)
        }
        if (isEmailChanging) {
          const { error: emError } = await supabase.auth.updateUser({ email: trimmedNewEmail })
          if (emError) throw new Error(emError.message)
        }

        setNewEmail('')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setSuccess('Account credentials updated successfully.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Admin Account"
        description="Manage your admin authentication credentials, login email, and password."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Account Info Sidebar / Overview Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-gold-50 border border-gold-300 flex items-center justify-center text-gold-700">
                <HiOutlineUserCircle className="size-8" />
              </div>
              <div className="min-w-0">
                <p className="text-body-sm font-semibold text-charcoal-900 truncate">Administrator</p>
                <p className="text-caption text-charcoal-600 font-medium truncate">Primary Account</p>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2.5">
              <div>
                <p className="text-overline text-charcoal-600">Active Login Email</p>
                <p className="text-body-sm font-medium text-charcoal-900 break-all">
                  {fetching ? 'Loading...' : currentEmail || 'Not set'}
                </p>
              </div>

              <div>
                <p className="text-overline text-charcoal-600">Authentication Mode</p>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 mt-1">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  {isLocalMode ? 'Local SQLite & Session' : 'Supabase Auth'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-ivory-50/70 p-4 text-caption text-charcoal-700 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-charcoal-900">
              <HiOutlineShieldCheck className="size-4 text-gold-600" />
              Security Notice
            </div>
            <p>
              Changes made here update your permanent admin credentials in the database. You will use these new credentials for future sign-ins.
            </p>
          </div>
        </div>

        {/* Change Credentials Form */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-border bg-surface-elevated p-6 shadow-xs">
            <h2 className="font-display text-heading-md text-charcoal-900 mb-1 flex items-center gap-2">
              <HiOutlineKey className="size-5 text-gold-600" />
              Change Login Credentials
            </h2>
            <p className="text-body-sm text-charcoal-600 mb-6">
              Update your administrative email address and/or password. Your current password is required to verify identity.
            </p>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-body-sm font-medium text-red-800" role="alert">
                <HiOutlineExclamationCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-body-sm font-medium text-emerald-800" role="status">
                <HiOutlineCheckCircle className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Email Display */}
              <FormField id="account-current-email" label="Current Email">
                <div className="relative">
                  <Input
                    type="email"
                    value={currentEmail}
                    disabled
                    className="bg-ivory-100/70 font-medium text-charcoal-800 cursor-not-allowed pl-10"
                  />
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-charcoal-500" />
                </div>
              </FormField>

              {/* New Email */}
              <FormField
                id="account-new-email"
                label="New Email"
                hint="Leave empty if you only want to change your password."
              >
                <div className="relative">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new login email"
                    className="pl-10"
                    autoComplete="username"
                  />
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-charcoal-500" />
                </div>
              </FormField>

              <hr className="border-border my-6" />

              {/* Current Password (Required) */}
              <FormField
                id="account-current-password"
                label="Current Password"
                required
                hint="Required to authorize changes to your account."
              >
                <div className="relative">
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="pl-10"
                    autoComplete="current-password"
                    required
                  />
                  <HiOutlineKey className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-charcoal-500" />
                </div>
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2 pt-1">
                {/* New Password */}
                <FormField
                  id="account-new-password"
                  label="New Password"
                  hint="Minimum 4 characters. Leave empty to keep existing password."
                >
                  <div className="relative">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="pl-10"
                      autoComplete="new-password"
                    />
                    <HiOutlineKey className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-charcoal-500" />
                  </div>
                </FormField>

                {/* Confirm New Password */}
                <FormField
                  id="account-confirm-password"
                  label="Confirm New Password"
                  hint="Must match new password."
                >
                  <div className="relative">
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="pl-10"
                      autoComplete="new-password"
                      disabled={!newPassword}
                    />
                    <HiOutlineKey className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-charcoal-500" />
                  </div>
                </FormField>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setNewEmail('')
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setError(null)
                    setSuccess(null)
                  }}
                  disabled={loading}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  isLoading={loading}
                >
                  Update Credentials
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

