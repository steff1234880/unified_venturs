export const colors = {
  ivory: {
    50: '#FAF9F6',
    100: '#F4F1EB',
    200: '#EAE5DC',
    300: '#DDD6CA',
    400: '#CCC2B3',
  },
  teak: {
    50: '#F4F1EB',
    100: '#EAE5DC',
    200: '#D6C9B7',
    300: '#9C8B77',
    400: '#59524A',
    500: '#2C2825',
    600: '#111111',
    700: '#1A1A1A',
    800: '#0B0B0B',
    900: '#050505',
  },
  gold: {
    50: '#FBF9F7',
    100: '#F5EFE8',
    200: '#EAE2D7',
    300: '#E0D6C9',
    400: '#D6C9B7',
    500: '#C2B39E',
    600: '#9C8B77',
    700: '#7A6B59',
  },
  emerald: {
    50: '#F3F5F3',
    100: '#E3E7E3',
    200: '#C3CCC4',
    300: '#98A799',
    400: '#6B7F6D',
    500: '#4B5E4D',
    600: '#374639',
    700: '#28342A',
  },
  terracotta: {
    400: '#A87660',
    500: '#8C5E4B',
  },
  saffron: {
    400: '#C29964',
    500: '#A67E4A',
  },
  stone: {
    300: '#DDD6CA',
    400: '#8F8880',
    500: '#6E6862',
    600: '#4A4643',
  },
  charcoal: {
    500: '#6E6862',
    600: '#4A4643',
    700: '#33302E',
    800: '#1F1D1B',
    900: '#111111',
    950: '#0A0A0A',
  },
} as const

export const semanticColors = {
  background: colors.ivory[50],
  foreground: colors.charcoal[800],
  surface: colors.ivory[100],
  primary: colors.teak[600],
  secondary: colors.gold[400],
  accent: colors.gold[400],
  muted: colors.stone[400],
  border: colors.ivory[300],
  destructive: '#B54A4A',
  success: colors.emerald[500],
} as const

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  section: {
    sm: '4rem',
    md: '6rem',
    lg: '8rem',
    xl: '10rem',
  },
} as const

export const radius = {
  none: '0',
  xs: '0.125rem',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.625rem',
  '2xl': '0.75rem',
  '3xl': '1rem',
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px rgb(17 17 17 / 0.03)',
  sm: '0 2px 6px rgb(17 17 17 / 0.04)',
  md: '0 4px 14px rgb(17 17 17 / 0.06)',
  lg: '0 8px 24px rgb(17 17 17 / 0.08)',
  xl: '0 12px 32px rgb(17 17 17 / 0.09)',
  gold: '0 4px 16px rgb(214 201 183 / 0.25)',
  emerald: '0 4px 16px rgb(55 70 57 / 0.12)',
} as const

export const typography = {
  fonts: {
    display: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  scale: {
    display2xl: '4.5rem',
    displayXl: '3.75rem',
    displayLg: '3rem',
    displayMd: '2.25rem',
    displaySm: '1.875rem',
    headingLg: '1.5rem',
    headingMd: '1.25rem',
    headingSm: '1.125rem',
    bodyLg: '1.125rem',
    bodyMd: '1rem',
    bodySm: '0.875rem',
    caption: '0.75rem',
    overline: '0.6875rem',
  },
} as const

export const transitions = {
  ease: {
    luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
    soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
} as const
