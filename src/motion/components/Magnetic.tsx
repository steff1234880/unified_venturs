import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

import { useMediaQuery, usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/utils'

type MagneticProps = {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({
  children,
  className,
  strength = 0.3,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 })

  if (prefersReducedMotion || !hasFinePointer) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex', className)}
      style={{ x: springX, y: springY }}
      onMouseMove={(event) => {
        const element = ref.current

        if (!element) {
          return
        }

        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        x.set((event.clientX - centerX) * strength)
        y.set((event.clientY - centerY) * strength)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
