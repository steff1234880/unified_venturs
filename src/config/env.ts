const getEnv = (key: keyof ImportMetaEnv, fallback = '') => {
  const value = import.meta?.env?.[key]

  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export const env = {
  appName: getEnv('VITE_APP_NAME', 'intereor'),
  appUrl: getEnv('VITE_APP_URL', 'http://localhost:5173'),
  apiUrl: getEnv('VITE_API_URL', 'https://unified-venturs-mzut.onrender.com'),
  supabaseUrl: getEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
  isDev: Boolean(import.meta?.env?.DEV),
  isProd: Boolean(import.meta?.env?.PROD),
} as const
