export type ProjectCategory = 'All' | 'Work Locations' | 'Completed Residences'

export const projectCategories: ProjectCategory[] = [
  'All',
  'Work Locations',
  'Completed Residences',
]

export const portfolioProjects = [
  {
    title: 'Prestige Park Square',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image: '/images/after-living-room.jpg',
    featured: true,
  },
  {
    title: 'Kolte Patil i-Towers',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image: '/placeholders/kolte-patil-i-towers.svg',
    featured: false,
  },
  {
    title: 'Brigade Cornerstone Utopia',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image: '/placeholders/brigade-cornerstone-utopia.svg',
    featured: false,
  },
  {
    title: 'Bren Zahara',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image: '/placeholders/bren-zahara.svg',
    featured: false,
  },
  {
    title: 'Alpine Viva',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image: '/placeholders/alpine-viva.svg',
    featured: false,
  },
] as const
