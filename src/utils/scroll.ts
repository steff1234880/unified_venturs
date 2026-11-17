export function scrollToHash(href: string) {
  const id = href.replace('/#', '')

  if (window.location.pathname === '/') {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    return true
  }

  return false
}
