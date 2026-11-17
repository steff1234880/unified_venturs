import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'

import { useMediaQuery, usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/utils'

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, label'

export function CustomCursor() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const ringX = useSpring(cursorX, { stiffness: 220, damping: 28 })
  const ringY = useSpring(cursorY, { stiffness: 220, damping: 28 })
  const dotX = useSpring(cursorX, { stiffness: 500, damping: 35 })
  const dotY = useSpring(cursorY, { stiffness: 500, damping: 35 })
  const scale = useSpring(1, { stiffness: 300, damping: 22 })

  const enabled = hasFinePointer && !prefersReducedMotion

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('cursor-none')
      return
    }

    document.body.classList.add('cursor-none')

    const move = (event: MouseEvent) => {
      cursorX.set(event.clientX)
      cursorY.set(event.clientY)
    }

    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        scale.set(1.6)
      }
    }

    const onOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        scale.set(1)
      }
    }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })

    return () => {
      document.body.classList.remove('cursor-none')
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [cursorX, cursorY, enabled, scale])

  if (!enabled) {
    return null
  }

  return (
    <>
      <motion.div
        className={cn(
          'pointer-events-none fixed top-0 left-0 z-[100]',
          'size-8 -translate-x-1/2 -translate-y-1/2 rounded-full',
          'border border-gold-400/60 mix-blend-difference',
        )}
        style={{ x: ringX, y: ringY, scale }}
        aria-hidden
      />
      <motion.div
        className={cn(
          'pointer-events-none fixed top-0 left-0 z-[100]',
          'size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500',
        )}
        style={{ x: dotX, y: dotY }}
        aria-hidden
      />
    </>
  )
}
