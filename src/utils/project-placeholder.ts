const PROJECT_PHOTO_MAP: Record<string, string> = {
  'prestige park square': '/images/after-living-room.jpg',
  'mother nature':
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  'kolte patil i-towers':
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  'kolte patil':
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  'brigade cornerstone utopia':
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  'brigade cornerstone':
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  'bren zahara':
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'alpine viva':
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
}

const DEFAULT_PHOTO = '/images/after-living-room.jpg'

export function getProjectImagePlaceholder(projectTitle?: string): string {
  if (!projectTitle) return DEFAULT_PHOTO
  const key = projectTitle.trim().toLowerCase()
  for (const [titlePattern, path] of Object.entries(PROJECT_PHOTO_MAP)) {
    if (key.includes(titlePattern)) {
      return path
    }
  }
  return DEFAULT_PHOTO
}

