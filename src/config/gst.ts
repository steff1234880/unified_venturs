export const UNIFIED_VENTURES_GST = {
  legalName: 'UNIFIED VENTURES',
  tradeName: 'UNIFIED VENTURES ATELIER',
  gstin: '29AAFCU1234F1Z5',
  pan: 'AAFCU1234F',
  cin: 'U74999KA2021PTC148900',
  arn: 'AA2903210123456',
  state: 'Karnataka',
  stateCode: '29',
  address: {
    building: '1&2, Site 1, Khata 164P',
    street: 'Kommasandra, Sarjapura',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '562125',
    country: 'India',
    full: '1&2, Site 1, Khata 164P, Kommasandra, Sarjapura, Bengaluru, Bengaluru Urban, Karnataka - 562125, India',
  },
  contact: {
    phone: '+91 88 6772 5353',
    email: 'support.unifiedventures@gmail.com',
    billingEmail: 'accounts@unifiedventures.in',
    website: 'https://unifiedventures.in',
  },
  bank: {
    bankName: 'HDFC Bank Ltd',
    accountName: 'UNIFIED VENTURES',
    accountNumber: '50200088992211',
    ifscCode: 'HDFC0001234',
    branch: 'Sarjapura Main Road, Bengaluru',
    upiId: 'unifiedventures@hdfcbank',
  },
  defaultSac: '998391', // Interior design services
  sacCodes: [
    { code: '998391', label: '998391 - Interior Design & Architectural Space Planning Services' },
    { code: '995471', label: '995471 - Glazing, Carpentry, Joinery & Bespoke Fit-out Works' },
    { code: '995472', label: '995472 - Plastering, Painting & Surface Treatment Services' },
    { code: '995473', label: '995473 - Floor & Wall Tiling, Travertine & Stone Laying Services' },
    { code: '998399', label: '998399 - Other Specialty Design & Turnkey Consultancy Services' },
  ],
  standardGstRates: [18, 12, 5, 28, 0],
} as const

