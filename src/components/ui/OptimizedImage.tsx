import type { ImgHTMLAttributes } from 'react'

import { cn } from '@/utils'

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean
}

export function OptimizedImage({
  priority = false,
  loading,
  decoding = 'async',
  fetchPriority,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <img
      alt={alt}
      loading={loading ?? (priority ? 'eager' : 'lazy')}
      decoding={decoding}
      fetchPriority={fetchPriority ?? (priority ? 'high' : 'auto')}
      className={cn(className)}
      {...props}
    />
  )
}
