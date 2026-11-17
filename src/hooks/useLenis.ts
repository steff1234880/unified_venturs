import { useLenisContext } from '@/providers/lenis-context'

export function useLenis() {
  try {
    return useLenisContext().lenis
  } catch {
    return null
  }
}
