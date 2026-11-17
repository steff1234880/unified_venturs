import { useLayoutEffect, useState } from 'react'

import { Logo } from '@/components/common'
import { usePrefersReducedMotion } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils'

const STORAGE_KEY = 'unified-ventures-loaded'

type LoadingScreenProps = {
  onComplete: () => void
}

function hasLoadedBefore() {
  return typeof window !== 'undefined' && !!sessionStorage.getItem(STORAGE_KEY)
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<'loading' | 'done'>(() =>
    hasLoadedBefore() ? 'done' : 'loading',
  )

  useLayoutEffect(() => {
    if (prefersReducedMotion || phase === 'done') {
      onComplete()
      return
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem(STORAGE_KEY, '1')
          gsap.to('[data-loader-screen]', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              setPhase('done')
              onComplete()
            },
          })
        },
      })

      timeline
        .from('[data-loader-logo]', {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: 'power3.out',
        })
        .from(
          '[data-loader-line]',
          { scaleX: 0, duration: 1.2, ease: 'power2.inOut' },
          0.3,
        )
        .to(
          '[data-loader-progress]',
          { scaleX: 1, duration: 1.6, ease: 'power2.inOut' },
          0.5,
        )
        .to('[data-loader-label]', { opacity: 1, duration: 0.4 }, 0.6)
    })

    return () => {
      ctx.revert()
    }
  }, [onComplete, phase, prefersReducedMotion])

  if (phase === 'done' || prefersReducedMotion) {
    return null
  }

  return (
    <div
      data-loader-screen
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center',
        'bg-charcoal-900 text-ivory-50',
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div data-loader-logo>
        <Logo size="xl" variant="light" />
      </div>
      <div
        data-loader-line
        className="mt-6 h-px w-48 origin-left bg-ivory-100/20"
        aria-hidden
      />
      <div className="relative mt-8 h-px w-56 overflow-hidden bg-ivory-100/10">
        <div
          data-loader-progress
          className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-linear-to-r from-gold-400 to-gold-600"
          aria-hidden
        />
      </div>
      <p data-loader-label className="mt-4 text-overline text-gold-400 opacity-0">
        Crafting Excellence
      </p>
    </div>
  )
}
