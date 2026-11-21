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
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    title: 'Brigade Cornerstone Utopia',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    title: 'Bren Zahara',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    title: 'Alpine Viva',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residences' as const,
    year: '2024',
    area: 'Bengaluru',
    image:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
] as const
