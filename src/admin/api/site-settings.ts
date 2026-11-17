import {
  getSiteSettings,
  saveSiteSettings,
} from '@/lib/site-settings'
import type { SiteSettings } from '@/types/site-settings'

export async function fetchSiteSettings(): Promise<SiteSettings> {
  await new Promise((resolve) => setTimeout(resolve, 120))
  return getSiteSettings()
}

export async function updateSiteSettings(
  data: Partial<Omit<SiteSettings, 'updatedAt'>>,
): Promise<SiteSettings> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return saveSiteSettings(data)
}
