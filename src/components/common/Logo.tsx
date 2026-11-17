import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { brand } from '@/config/brand'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { getLogoSources } from '@/lib/site-settings'
import { cn } from '@/utils'

const sizeClasses = {
  sm: 'h-8 max-w-[120px]',
  md: 'h-10 md:h-11 max-w-[180px]',
  lg: 'h-12 md:h-14 max-w-[220px]',
  xl: 'h-16 md:h-20 max-w-[280px] sm:max-w-[340px]',
  header: 'h-9 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-[4.75rem] max-w-[180px] sm:max-w-[220px] md:max-w-[280px] 2xl:max-w-[320px]',
} as const

type LogoProps = {
  size?: keyof typeof sizeClasses
  variant?: 'default' | 'light'
  className?: string
  imageClassName?: string
  asLink?: boolean
  alt?: string
}

export function Logo({
  size = 'md',
  variant = 'default',
  className,
  imageClassName,
  asLink = false,
  alt,
}: LogoProps) {
  const siteSettings = useSiteSettings()
  const { defaultSrc, lightSrc, defaultFallback, lightFallback } = getLogoSources(siteSettings)

  const intendedSrc = variant === 'light' ? lightSrc : defaultSrc
  const fallbackSrc = variant === 'light' ? lightFallback : defaultFallback

  const [hasError, setHasError] = useState(false)

  // Reset error state whenever the intended logo source changes
  useEffect(() => {
    setHasError(false)
  }, [intendedSrc])

  const effectiveSrc = hasError ? fallbackSrc : intendedSrc

  const image = (
    <img
      src={effectiveSrc}
      alt={alt || brand.logoAlt}
      width={280}
      height={50}
      decoding="async"
      loading="eager"
      onError={() => {
        if (!hasError && effectiveSrc !== fallbackSrc) {
          setHasError(true)
        }
      }}
      className={cn(
        'w-auto object-contain shrink-0 transition-opacity duration-200',
        sizeClasses[size],
        imageClassName,
      )}
    />
  )

  if (asLink) {
    return (
      <Link
        to="/"
        className={cn('inline-flex items-center shrink-0 ds-focus-ring', className)}
        aria-label={`${brand.logoAlt} home`}
      >
        {image}
      </Link>
    )
  }

  return <div className={cn('inline-flex items-center shrink-0', className)}>{image}</div>
}
