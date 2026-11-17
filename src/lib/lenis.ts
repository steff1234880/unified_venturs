import Lenis from 'lenis'

export type LenisOptions = ConstructorParameters<typeof Lenis>[0]

export const defaultLenisOptions: LenisOptions = {
  autoRaf: true,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  smoothWheel: true,
}

export function createLenis(options?: LenisOptions) {
  return new Lenis({ ...defaultLenisOptions, ...options })
}

export { Lenis }
