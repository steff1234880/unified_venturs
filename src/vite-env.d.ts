/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ADMIN_PASSWORD: string
  readonly VITE_WHATSAPP_PHONE: string
  readonly VITE_WHATSAPP_MESSAGE: string
  readonly VITE_WHATSAPP_ENABLED: string
  readonly VITE_SOCIAL_INSTAGRAM_URL: string
  readonly VITE_SOCIAL_INSTAGRAM_ENABLED: string
  readonly VITE_SOCIAL_PINTEREST_URL: string
  readonly VITE_SOCIAL_PINTEREST_ENABLED: string
  readonly VITE_SOCIAL_LINKEDIN_URL: string
  readonly VITE_SOCIAL_LINKEDIN_ENABLED: string
  readonly VITE_SOCIAL_FACEBOOK_URL: string
  readonly VITE_SOCIAL_FACEBOOK_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
