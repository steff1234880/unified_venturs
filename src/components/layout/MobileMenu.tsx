import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowRight } from 'react-icons/hi'

import { Button } from '@/components/ui'
import { ctaLink, navLinks } from '@/components/layout/nav-links'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useScrollLock } from '@/hooks'
import { Magnetic } from '@/motion'
import { cn } from '@/utils'

type MobileMenuProps = {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement>(null)
  useScrollLock(isOpen)

  const handleNavClick = (href: string) => {
    navigate(href)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    navRef.current?.querySelector<HTMLElement>('button')?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-charcoal-900/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.nav
            ref={navRef}
            id="mobile-navigation"
            className={cn(
              'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col',
              'border-l border-ivory-300 bg-ivory-50/98 backdrop-blur-xl lg:hidden',
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Mobile navigation"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-ivory-300 px-6 py-4">
              <span className="text-overline text-gold-600">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center text-overline text-charcoal-700 transition-colors hover:text-teak-600 ds-focus-ring"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            <motion.ul
              className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.li key={link.href} variants={staggerItem}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="group flex min-h-12 w-full items-center justify-between border-b border-ivory-200 py-4 text-left transition-colors hover:border-gold-300"
                  >
                    <span className="font-display text-heading-lg text-charcoal-900 transition-colors group-hover:text-teak-600 font-medium tracking-tight">
                      {link.label}
                    </span>
                    <HiOutlineArrowRight
                      className="size-5 text-gold-500 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                      aria-hidden
                    />
                  </button>
                </motion.li>
              ))}
            </motion.ul>

            <div className="border-t border-ivory-300 p-6">
              <Magnetic className="w-full">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  onClick={() => handleNavClick(ctaLink.href)}
                >
                  {ctaLink.label}
                </Button>
              </Magnetic>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
