export const galleryCollections = [
  {
    name: 'Living Spaces',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
        alt: 'Grand living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        alt: 'Warm lounge seating',
      },
      {
        src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
        alt: 'Open plan living',
      },
    ],
  },
  {
    name: 'Bedrooms & Suites',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
        alt: 'Master suite',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80',
        alt: 'Luxury bathroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80',
        alt: 'Guest bedroom',
      },
    ],
  },
  {
    name: 'Details & Craft',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
        alt: 'Carved wood detail',
      },
      {
        src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cd7e?auto=format&fit=crop&w=1000&q=80',
        alt: 'Brass hardware',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
        alt: 'Marble inlay',
      },
    ],
  },
] as const

export const galleryRows = [
  galleryCollections[0].images,
  galleryCollections[1].images,
  galleryCollections[2].images,
] as const
