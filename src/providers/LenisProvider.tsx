import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { useMediaQuery, usePrefersReducedMotion } from '@/hooks'
import { ScrollTrigger } from '@/lib/gsap'
import { createLenis, type Lenis, type LenisOptions } from '@/lib/lenis'
import { setScrollPosition } from '@/lib/scroll-position'

import { LenisContext } from './lenis-context'

type LenisProviderProps = {
  children: ReactNode
  options?: LenisOptions
}

export function LenisProvider({ children, options }: LenisProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const prefersCoarsePointer = useMediaQuery('(pointer: coarse)')
  const enabled = !prefersReducedMotion && !prefersCoarsePointer
  const [activeLenis, setActiveLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) {
      setActiveLenis(null)
      return
    }

    const instance = createLenis(options)
    setActiveLenis(instance)

    const onScroll = ({ scroll }: { scroll: number }) => {
      setScrollPosition(scroll)
      ScrollTrigger.update()
    }

    instance.on('scroll', onScroll)

    return () => {
      instance.off('scroll', onScroll)
      instance.destroy()
      setActiveLenis(null)
    }
  }, [enabled, options])

  const value = useMemo(() => (activeLenis ? { lenis: activeLenis } : null), [activeLenis])

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
}
