import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  HiOutlineBookOpen,
  HiOutlineChatAlt2,
  HiOutlineCollection,
  HiOutlineCog,
  HiOutlineDocumentReport,
  HiOutlineHome,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlinePhotograph,
  HiOutlineQuestionMarkCircle,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineViewGrid,
  HiOutlineX,
} from 'react-icons/hi'

import { Logo } from '@/components/common'
import { useAuth } from '@/admin/auth/AuthProvider'
import { useDashboardStats } from '@/admin/hooks/useAdminData'
import { useScrollLock } from '@/hooks'
import { cn } from '@/utils'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
  { to: '/admin/invoices', label: 'GST Invoices', icon: HiOutlineDocumentReport },
  { to: '/admin/notepad', label: 'Notepad', icon: HiOutlineBookOpen },
  { to: '/admin/projects', label: 'Projects', icon: HiOutlineCollection },
  { to: '/admin/gallery', label: 'Gallery', icon: HiOutlinePhotograph },
  { to: '/admin/services', label: 'Services', icon: HiOutlineSparkles },
  { to: '/admin/testimonials', label: 'Testimonials', icon: HiOutlineStar },
  { to: '/admin/faq', label: 'FAQ', icon: HiOutlineQuestionMarkCircle },
  { to: '/admin/messages', label: 'Messages', icon: HiOutlineChatAlt2 },
  { to: '/admin/settings', label: 'Site Settings', icon: HiOutlineCog },
] as const

export function AdminSidebar({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void
  onClose?: () => void
}) {
  const stats = useDashboardStats()

  return (
    <aside className="flex h-full w-64 max-w-full shrink-0 flex-col overflow-y-auto border-r border-border bg-charcoal-900 text-ivory-100">
      <div className="flex items-center justify-between border-b border-ivory-100/10 px-6 py-5">
        <div>
          <Logo size="md" variant="light" />
          <p className="mt-1 text-caption text-gold-400">Admin Console</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-md text-ivory-100/70 hover:bg-ivory-100/10 hover:text-ivory-50 lg:hidden ds-focus-ring"
            aria-label="Close admin menu"
          >
            <HiOutlineX className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4" aria-label="Admin navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            end={'end' in item ? item.end : false}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm transition-colors',
                isActive
                  ? 'bg-white/10 text-gold-400 font-medium'
                  : 'text-ivory-100/70 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <item.icon className="size-5 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {item.to === '/admin/messages' && stats.unreadMessages > 0 && (
              <span className="rounded-xs bg-gold-400 px-2 py-0.5 text-[11px] font-mono font-medium text-charcoal-950">
                {stats.unreadMessages}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ivory-100/10 p-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm text-ivory-100/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <HiOutlineHome className="size-5" aria-hidden />
          View Site
        </a>
      </div>
    </aside>
  )
}

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { userEmail, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-surface-elevated px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin menu"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-charcoal-800 hover:bg-ivory-100 lg:hidden ds-focus-ring"
        >
          <HiOutlineMenu className="size-6" aria-hidden />
        </button>
        <p className="min-w-0 truncate text-body-sm text-muted-foreground">
          <span className="hidden sm:inline">Signed in as </span>
          <span className="font-medium text-charcoal-900">{userEmail}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          void logout().then(() => navigate('/admin/login'))
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-body-sm text-charcoal-700 transition-colors hover:bg-ivory-100 hover:text-teak-700 ds-focus-ring"
      >
        <HiOutlineLogout className="size-4" aria-hidden />
        Sign out
      </button>
    </header>
  )
}

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  useScrollLock(menuOpen)

  return (
    <div className="flex min-h-dvh overflow-x-clip bg-ivory-50">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-xs"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <AdminSidebar
              onNavigate={() => setMenuOpen(false)}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMenuOpen(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
