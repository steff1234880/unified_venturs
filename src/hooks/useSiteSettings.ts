import { useSyncExternalStore } from 'react'

import {
  getSiteSettings,
  subscribeSiteSettings,
} from '@/lib/site-settings'

export function useSiteSettings() {
  return useSyncExternalStore(subscribeSiteSettings, getSiteSettings, getSiteSettings)
}
