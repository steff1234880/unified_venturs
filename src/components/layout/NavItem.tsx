import { NavLink } from 'react-router-dom'

import { cn } from '@/utils'

type NavItemProps = {
  href: string
  label: string
  scrolled: boolean
  onClick?: () => void
  className?: string
}

export function NavItem({
  href,
  label,
  scrolled,
  onClick,
  className,
}: NavItemProps) {
  return (
    <NavLink
      to={href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative py-1 font-body text-overline transition-luxury',
          scrolled
            ? isActive
              ? 'text-teak-600'
              : 'text-charcoal-700 hover:text-teak-600'
            : isActive
              ? 'text-ivory-50'
              : 'text-ivory-100/90 hover:text-ivory-50',
          className,
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative z-10 inline-block transition-[letter-spacing] duration-300 group-hover:tracking-[0.18em]">
            {label}
          </span>
          <span
            className={cn(
              'absolute -bottom-0.5 left-1/2 h-px w-full -translate-x-1/2 origin-center',
              'bg-linear-to-r from-transparent via-gold-400 to-transparent',
              'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
            )}
            aria-hidden
          />
        </>
      )}
    </NavLink>
  )
}
