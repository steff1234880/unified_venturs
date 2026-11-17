import type { Transition, Variants } from 'framer-motion'

export const luxuryEase = [0.22, 1, 0.36, 1] as const

export const defaultTransition: Transition = {
  duration: 0.6,
  ease: luxuryEase,
}

export const fastTransition: Transition = {
  duration: 0.25,
  ease: luxuryEase,
}

export const slowTransition: Transition = {
  duration: 0.9,
  ease: luxuryEase,
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: defaultTransition,
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: defaultTransition,
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
}

export const revealLine: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { ...slowTransition, delay: 0.2 },
  },
}

export const hoverLift = {
  rest: { y: 0, boxShadow: 'var(--shadow-sm)' },
  hover: {
    y: -4,
    boxShadow: 'var(--shadow-lg)',
    transition: fastTransition,
  },
}

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...defaultTransition, duration: 0.55 },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(4px)',
    transition: { ...fastTransition, duration: 0.35 },
  },
}
