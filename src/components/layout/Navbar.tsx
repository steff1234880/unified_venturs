import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { Logo } from '@/components/common'
import { useScrolled } from '@/hooks'
import { Magnetic } from '@/motion'
import { cn } from '@/utils'

import { MobileMenu } from './MobileMenu'
import { NavItem } from './NavItem'
import { ctaLink, navLinks } from './nav-links'

function MenuToggle({
  isOpen,
  scrolled,
  onClick,
}: {
  isOpen: boolean
  scrolled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'relative flex size-11 items-center justify-center rounded-md transition-luxury ds-focus-ring lg:hidden',
        scrolled
          ? 'text-charcoal-800 hover:bg-ivory-200'
          : 'text-ivory-50 hover:bg-ivory-50/10',
      )}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <span className="relative block size-5" aria-hidden>
        <motion.span
          className={cn(
            'absolute left-0 block h-px w-5 origin-center',
            scrolled ? 'bg-charcoal-800' : 'bg-ivory-50',
          )}
          animate={
            isOpen
              ? { top: '50%', rotate: 45, y: '-50%' }
              : { top: 4, rotate: 0, y: 0 }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className={cn(
            'absolute left-0 top-1/2 block h-px w-5 -translate-y-1/2',
            scrolled ? 'bg-charcoal-800' : 'bg-ivory-50',
          )}
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className={cn(
            'absolute left-0 block h-px w-5 origin-center',
            scrolled ? 'bg-charcoal-800' : 'bg-ivory-50',
          )}
          animate={
            isOpen
              ? { bottom: '50%', rotate: -45, y: '50%' }
              : { bottom: 4, rotate: 0, y: 0 }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </button>
  )
}

export function Navbar() {
  const location = useLocation()
  const scrollScrolled = useScrolled(48)
  const scrolled = location.pathname !== '/' || scrollScrolled
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  const handleCtaClick = () => {
    navigate(ctaLink.href)
  }

  return (
    <>
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-30 w-full border-b',
          scrolled && 'backdrop-blur-xl',
        )}
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? 'rgba(250, 249, 246, 0.96)'
            : 'rgba(250, 249, 246, 0)',
          borderBottomColor: scrolled
            ? 'rgba(221, 214, 202, 0.8)'
            : 'rgba(221, 214, 202, 0)',
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ds-container">
          <div
            className={cn(
              'flex items-center justify-between gap-4 sm:gap-6 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              scrolled ? 'py-2.5 sm:py-3.5' : 'py-3.5 sm:py-5',
            )}
          >
            <Logo
              asLink
              size="header"
              variant={scrolled ? 'default' : 'light'}
            />

            <nav
              className="hidden items-center gap-10 lg:flex"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  scrolled={scrolled}
                />
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Magnetic className="hidden lg:inline-flex">
                <Button
                  variant={scrolled ? 'primary' : 'outline-ivory'}
                  size="md"
                  onClick={handleCtaClick}
                >
                  {ctaLink.label}
                </Button>
              </Magnetic>

              <MenuToggle
                isOpen={mobileOpen}
                scrolled={scrolled}
                onClick={() => setMobileOpen((open) => !open)}
              />
            </div>
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-linear-to-r from-transparent via-gold-400/50 to-transparent"
          initial={false}
          animate={{ scaleX: scrolled ? 1 : 0, opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
      </motion.header>

      <MobileMenu isOpen={mobileOpen} onClose={closeMobile} />
    </>
  )
}
