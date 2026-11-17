const PROJECT_PLACEHOLDER_MAP: Record<string, string> = {
  'prestige park square': '/placeholders/prestige-park-square.svg',
  'kolte patil i-towers': '/placeholders/kolte-patil-i-towers.svg',
  'kolte patil': '/placeholders/kolte-patil-i-towers.svg',
  'brigade cornerstone utopia': '/placeholders/brigade-cornerstone-utopia.svg',
  'brigade cornerstone': '/placeholders/brigade-cornerstone-utopia.svg',
  'bren zahara': '/placeholders/bren-zahara.svg',
  'alpine viva': '/placeholders/alpine-viva.svg',
}

export function getProjectImagePlaceholder(projectTitle?: string): string {
  if (!projectTitle) return '/placeholders/prestige-park-square.svg'
  const key = projectTitle.trim().toLowerCase()
  for (const [titlePattern, path] of Object.entries(PROJECT_PLACEHOLDER_MAP)) {
    if (key.includes(titlePattern)) {
      return path
    }
  }
  return '/placeholders/prestige-park-square.svg'
}

