import { useState, type ReactNode } from 'react'

import { usePrefersReducedMotion } from '@/hooks'

import { CustomCursor } from './components/CustomCursor'
import { LoadingScreen } from './components/LoadingScreen'
import { ScrollProgress } from './components/ScrollProgress'

type MotionProviderProps = {
  children: ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const enableLoader = !import.meta.env.PROD && !prefersReducedMotion
  const [showLoader, setShowLoader] = useState(enableLoader)

  return (
    <>
      {children}
      <ScrollProgress />
      {!prefersReducedMotion && <CustomCursor />}
      {showLoader && enableLoader && (
        <LoadingScreen onComplete={() => setShowLoader(false)} />
      )}
    </>
  )
}
