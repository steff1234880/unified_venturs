import { createContext, useContext } from 'react'

import type { Lenis } from '@/lib/lenis'

export type LenisContextValue = {
  lenis: Lenis
}

export const LenisContext = createContext<LenisContextValue | null>(null)

export function useLenisContext() {
  const context = useContext(LenisContext)

  if (context === null) {
    throw new Error('useLenisContext must be used within LenisProvider')
  }

  return context
}
