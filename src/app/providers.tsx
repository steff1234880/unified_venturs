import type { ReactNode } from 'react'

import { MotionConfig } from '@/lib/motion'
import { LenisProvider } from '@/providers/LenisProvider'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
