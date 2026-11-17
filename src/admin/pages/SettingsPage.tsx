import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type TouchEvent } from 'react'
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineSwitchHorizontal,
  HiOutlineTrash,
} from 'react-icons/hi'

import { PageHeader } from '@/admin/components/PageHeader'
import { ImageUpload } from '@/admin/components/ImageUpload'
import { fetchSiteSettings, updateSiteSettings } from '@/admin/api/site-settings'
import { socialIconMap, type SocialPlatform } from '@/config/social'
import {
  DEFAULT_BEFORE_AFTER,
  DEFAULT_CONTACT_PERSONS,
  getLogoSources,
  SOCIAL_PLATFORMS,
  validateSocialUrl,
} from '@/lib/site-settings'
import { Button, FormField, Input, Textarea } from '@/components/ui'
import type { ContactPerson, SocialSettings } from '@/types/site-settings'

const socialLabels: Record<SocialPlatform, { label: string; placeholder: string }> = {
  instagram: { label: 'Instagram URL', placeholder: 'https://instagram.com/yourprofile' },
  pinterest: { label: 'Pinterest URL', placeholder: 'https://pinterest.com/yourprofile' },
  linkedin: { label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/yourcompany' },
  facebook: { label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
}

const emptySocial = Object.fromEntries(
  SOCIAL_PLATFORMS.map((platform) => [platform, { url: '', enabled: true }]),
) as SocialSettings

export function AdminSettingsPage() {
  const [form, setForm] = useState({
    email: '',
    whatsappPhone: '',
    contactPersons: [] as ContactPerson[],
    social: emptySocial,
    location: '',
    logoUrl: '',
    logoLightUrl: '',
    beforeAfterOverline: DEFAULT_BEFORE_AFTER.overline,
    beforeAfterHeading: DEFAULT_BEFORE_AFTER.heading,
    beforeAfterDescription: DEFAULT_BEFORE_AFTER.description,
    beforeAfterBeforeImage: DEFAULT_BEFORE_AFTER.beforeImage,
    beforeAfterAfterImage: DEFAULT_BEFORE_AFTER.afterImage,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Preview interactive comparison slider state
  const [previewSlider, setPreviewSlider] = useState(50)
  const [isPreviewDragging, setIsPreviewDragging] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const settings = await fetchSiteSettings()

        if (!cancelled) {
          setForm({
            email: settings.email,
            whatsappPhone: settings.whatsappPhone,
            contactPersons:
              Array.isArray(settings.contactPersons) && settings.contactPersons.length > 0
                ? settings.contactPersons
                : DEFAULT_CONTACT_PERSONS,
            social: settings.social,
            location: settings.location,
            logoUrl: settings.logoUrl ?? '',
            logoLightUrl: settings.logoLightUrl ?? '',
            beforeAfterOverline:
              settings.beforeAfterOverline || DEFAULT_BEFORE_AFTER.overline,
            beforeAfterHeading:
              settings.beforeAfterHeading || DEFAULT_BEFORE_AFTER.heading,
            beforeAfterDescription:
              settings.beforeAfterDescription || DEFAULT_BEFORE_AFTER.description,
            beforeAfterBeforeImage:
              settings.beforeAfterBeforeImage || DEFAULT_BEFORE_AFTER.beforeImage,
            beforeAfterAfterImage:
              settings.beforeAfterAfterImage || DEFAULT_BEFORE_AFTER.afterImage,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load settings.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const invalid = SOCIAL_PLATFORMS.find((platform) =>
      validateSocialUrl(platform, form.social[platform].url),
    )

    if (invalid) {
      setSaving(false)
      setError(
        `${socialLabels[invalid].label}: ${validateSocialUrl(invalid, form.social[invalid].url)}`,
      )
      return
    }

    try {
      await updateSiteSettings(form)
      setSuccess('Site settings saved successfully. Changes are now live on the website.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  // Preview slider handlers
  const updatePreviewPosition = (clientX: number) => {
    if (!previewContainerRef.current) return
    const rect = previewContainerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPreviewSlider(percentage)
  }

  const handlePreviewMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsPreviewDragging(true)
    updatePreviewPosition(e.clientX)
  }

  useEffect(() => {
    if (!isPreviewDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      updatePreviewPosition(e.clientX)
    }

    const handleMouseUp = () => {
      setIsPreviewDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPreviewDragging])

  const handlePreviewTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (touch) {
      setIsPreviewDragging(true)
      updatePreviewPosition(touch.clientX)
    }
  }

  const handlePreviewTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (touch) {
      updatePreviewPosition(touch.clientX)
    }
  }

  const handlePreviewTouchEnd = () => {
    setIsPreviewDragging(false)
  }

  const logoSources = getLogoSources(form)

  const activeBeforeImage = form.beforeAfterBeforeImage || DEFAULT_BEFORE_AFTER.beforeImage
  const activeAfterImage = form.beforeAfterAfterImage || DEFAULT_BEFORE_AFTER.afterImage

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Settings"
        description="Customize branding, logos, Before & After showcase, and contact details shown across the website."
      />

      {loading ? (
        <p className="text-body-sm text-muted-foreground">Loading settings...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl space-y-8 rounded-xl border border-border bg-surface-elevated p-6 md:p-8"
        >
          {/* 1. SINGLE BEFORE & AFTER SHOWCASE EDITING */}
          <fieldset className="space-y-6 rounded-xl border border-gold-300/40 bg-gold-50/20 p-5 md:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
              <div>
                <legend className="text-heading-sm font-semibold text-charcoal-900 flex items-center gap-2">
                  <HiOutlineSparkles className="size-5 text-gold-500" />
                  Before & After Showcase
                </legend>
                <p className="mt-1 text-caption text-muted-foreground">
                  Configure the single Before & After transformation section shown on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    beforeAfterOverline: DEFAULT_BEFORE_AFTER.overline,
                    beforeAfterHeading: DEFAULT_BEFORE_AFTER.heading,
                    beforeAfterDescription: DEFAULT_BEFORE_AFTER.description,
                    beforeAfterBeforeImage: DEFAULT_BEFORE_AFTER.beforeImage,
                    beforeAfterAfterImage: DEFAULT_BEFORE_AFTER.afterImage,
                  }))
                }
                className="inline-flex items-center text-caption text-teak-600 hover:text-teak-800 underline self-start sm:self-auto cursor-pointer"
              >
                Reset to default transformation
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="settings-ba-overline"
                label="Section Overline Tag"
                hint="Small uppercase tag above the heading"
              >
                <Input
                  value={form.beforeAfterOverline}
                  onChange={(e) =>
                    setForm((cur) => ({ ...cur, beforeAfterOverline: e.target.value }))
                  }
                  placeholder="Spatial Metamorphosis"
                />
              </FormField>

              <FormField
                id="settings-ba-heading"
                label="Section Heading"
                hint="Main title displayed on the section"
                required
              >
                <Input
                  value={form.beforeAfterHeading}
                  onChange={(e) =>
                    setForm((cur) => ({ ...cur, beforeAfterHeading: e.target.value }))
                  }
                  placeholder="Before & After Revelations"
                  required
                />
              </FormField>
            </div>

            <FormField
              id="settings-ba-desc"
              label="Short Description"
              hint="Brief narrative explaining the transformation"
            >
              <Textarea
                value={form.beforeAfterDescription}
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, beforeAfterDescription: e.target.value }))
                }
                placeholder="Witness the bespoke evolution of bare architectural shells into transcendent residential sanctuaries."
                rows={2}
              />
            </FormField>

            {/* Matching Before & After Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="rounded-lg border border-border bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-2 rounded-full bg-stone-400" />
                  <span className="text-body-sm font-semibold text-charcoal-900">
                    BEFORE Photo (Unfinished / Raw)
                  </span>
                </div>
                <ImageUpload
                  id="settings-ba-before"
                  label="Before Image URL / Upload"
                  hint="Original unfinished, outdated or bare interior. Same camera angle and perspective."
                  value={form.beforeAfterBeforeImage}
                  onChange={(url) =>
                    setForm((cur) => ({ ...cur, beforeAfterBeforeImage: url }))
                  }
                  folder="transformations"
                  previewFit="cover"
                />
              </div>

              <div className="rounded-lg border border-border bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-2 rounded-full bg-gold-400" />
                  <span className="text-body-sm font-semibold text-charcoal-900">
                    AFTER Photo (Completed Luxury)
                  </span>
                </div>
                <ImageUpload
                  id="settings-ba-after"
                  label="After Image URL / Upload"
                  hint="Completed high-end version of the EXACT SAME room and perspective."
                  value={form.beforeAfterAfterImage}
                  onChange={(url) =>
                    setForm((cur) => ({ ...cur, beforeAfterAfterImage: url }))
                  }
                  folder="transformations"
                  previewFit="cover"
                />
              </div>
            </div>

            {/* Live Interactive Comparison Preview in Admin */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-overline text-charcoal-800 font-semibold">
                    Live Split Slider Preview
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Drag the slider to test the side-by-side comparison before saving.
                  </p>
                </div>
                <span className="text-caption text-gold-600 font-medium">
                  {Math.round(previewSlider)}% Before / {100 - Math.round(previewSlider)}% After
                </span>
              </div>

              <div
                ref={previewContainerRef}
                className="relative aspect-16/9 w-full rounded-lg overflow-hidden border border-border bg-charcoal-950 shadow-md cursor-ew-resize select-none touch-none"
                onMouseDown={handlePreviewMouseDown}
                onTouchStart={handlePreviewTouchStart}
                onTouchMove={handlePreviewTouchMove}
                onTouchEnd={handlePreviewTouchEnd}
              >
                {/* AFTER IMAGE (Base layer) */}
                <div className="absolute inset-0 size-full pointer-events-none">
                  <img
                    src={activeAfterImage}
                    alt="After preview"
                    className="size-full object-cover"
                  />
                </div>

                {/* BEFORE IMAGE (Clipped layer) */}
                <div
                  className="absolute inset-0 size-full overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(0 0, ${previewSlider}% 0, ${previewSlider}% 100%, 0 100%)`,
                    WebkitClipPath: `polygon(0 0, ${previewSlider}% 0, ${previewSlider}% 100%, 0 100%)`,
                  }}
                >
                  <img
                    src={activeBeforeImage}
                    alt="Before preview"
                    className="size-full object-cover"
                  />
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute inset-y-0 z-20 pointer-events-none"
                  style={{ left: `${previewSlider}%` }}
                >
                  <div className="absolute top-0 bottom-0 -left-px w-0.5 bg-gold-400 shadow-[0_0_8px_rgba(214,201,183,0.9)]" />
                  <div className="absolute top-1/2 -left-4 -translate-y-1/2 size-8 rounded-full bg-charcoal-900 border border-gold-400 text-gold-300 flex items-center justify-center shadow-lg">
                    <HiOutlineSwitchHorizontal className="size-4" />
                  </div>
                </div>

                {/* Badge tags */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="rounded-full bg-charcoal-950/80 border border-white/20 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-ivory-100">
                    Before
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="rounded-full bg-charcoal-950/80 border border-gold-400/50 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gold-400">
                    After
                  </span>
                </div>
              </div>
            </div>
          </fieldset>

          {/* 2. Logo & Branding Management */}
          <fieldset className="space-y-6 rounded-xl border border-border bg-ivory-50/60 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
              <div>
                <legend className="text-heading-sm font-semibold text-charcoal-900">
                  Website Logo & Branding
                </legend>
                <p className="mt-1 text-caption text-muted-foreground">
                  Centrally manage the logo displayed across the website header, mobile header, footer, and loading screen.
                </p>
              </div>
              {logoSources.hasCustomLogo && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      logoUrl: '',
                      logoLightUrl: '',
                    }))
                  }
                  className="inline-flex items-center text-caption text-teak-600 hover:text-teak-800 underline self-start sm:self-auto cursor-pointer"
                >
                  Restore default logo
                </button>
              )}
            </div>

            <ImageUpload
              id="settings-logo-main"
              label="Primary Website Logo"
              hint="Main logo used across the header (mobile and desktop), footer, and loading screen. Supports SVG, PNG, WebP, JPG."
              value={form.logoUrl}
              onChange={(url) => setForm((current) => ({ ...current, logoUrl: url }))}
              folder="branding"
              previewFit="contain"
            />

            <ImageUpload
              id="settings-logo-light"
              label="Light Logo Variant (Optional)"
              hint="Optional light/inverted logo for dark backgrounds (footer, dark header, loading screen). If left empty, your primary logo is automatically used."
              value={form.logoLightUrl}
              onChange={(url) => setForm((current) => ({ ...current, logoLightUrl: url }))}
              folder="branding"
              previewFit="contain"
              previewBackground="bg-charcoal-900"
            />

            {/* Live Previews */}
            <div className="space-y-2 pt-2">
              <p className="text-overline text-charcoal-700">Live Logo Preview</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-white p-4 text-center">
                  <p className="mb-2 text-caption text-muted-foreground font-medium">
                    Sticky Header (Light Background)
                  </p>
                  <div className="flex h-16 items-center justify-center">
                    <img
                      src={logoSources.defaultSrc}
                      alt="Header logo preview"
                      className="max-h-12 max-w-[200px] w-auto object-contain"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-charcoal-700 bg-charcoal-900 p-4 text-center">
                  <p className="mb-2 text-caption text-ivory-100/70 font-medium">
                    Loading Screen & Footer (Dark Background)
                  </p>
                  <div className="flex h-16 items-center justify-center">
                    <img
                      src={logoSources.lightSrc}
                      alt="Loading screen & footer logo preview"
                      className="max-h-12 max-w-[200px] w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          {/* 3. Contact & Phone Information */}
          <fieldset className="space-y-6 rounded-xl border border-border bg-ivory-50/60 p-5 md:p-6">
            <div className="border-b border-border pb-4">
              <legend className="text-heading-sm font-semibold text-charcoal-900">
                Contact Information & Advisors
              </legend>
              <p className="mt-1 text-caption text-muted-foreground">
                Manage the primary support email and direct contact persons displayed in the Contact Us section and Website Footer.
              </p>
            </div>

            <FormField id="settings-email" label="Support / Inquiries Email" required>
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="support.unifiedventures@gmail.com"
                required
              />
            </FormField>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-body-sm font-semibold text-charcoal-900">
                    Contact Persons ({form.contactPersons.length})
                  </h4>
                  <p className="text-caption text-muted-foreground">
                    Names, phone numbers, and WhatsApp action buttons shown in Contact Us and Footer.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPerson: ContactPerson = {
                      id: `person-${Date.now()}`,
                      name: '',
                      phone: '',
                    }
                    setForm((current) => ({
                      ...current,
                      contactPersons: [...current.contactPersons, newPerson],
                    }))
                  }}
                  className="gap-1.5"
                >
                  <HiOutlinePlus className="size-4" />
                  <span>Add Person</span>
                </Button>
              </div>

              {form.contactPersons.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center text-body-sm text-muted-foreground">
                  No contact persons added yet. Click &quot;Add Person&quot; above to add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.contactPersons.map((person, index) => {
                    const updatePerson = (patch: Partial<ContactPerson>) => {
                      setForm((current) => ({
                        ...current,
                        contactPersons: current.contactPersons.map((p, i) =>
                          i === index ? { ...p, ...patch } : p,
                        ),
                      }))
                    }

                    const removePerson = () => {
                      setForm((current) => ({
                        ...current,
                        contactPersons: current.contactPersons.filter((_, i) => i !== index),
                      }))
                    }

                    const movePerson = (direction: 'up' | 'down') => {
                      const newIndex = direction === 'up' ? index - 1 : index + 1
                      if (newIndex < 0 || newIndex >= form.contactPersons.length) return

                      setForm((current) => {
                        const next = [...current.contactPersons]
                        const [moved] = next.splice(index, 1)
                        if (moved) {
                          next.splice(newIndex, 0, moved)
                        }
                        return { ...current, contactPersons: next }
                      })
                    }

                    return (
                      <div
                        key={person.id}
                        className="rounded-lg border border-border bg-white p-4 shadow-2xs space-y-3 transition-colors hover:border-gold-400"
                      >
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <span className="text-overline font-semibold text-gold-600">
                            Advisor #{index + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => movePerson('up')}
                              disabled={index === 0}
                              aria-label={`Move ${person.name || 'advisor'} up`}
                              className="rounded p-1 text-charcoal-500 hover:bg-ivory-100 hover:text-charcoal-900 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <HiOutlineArrowUp className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => movePerson('down')}
                              disabled={index === form.contactPersons.length - 1}
                              aria-label={`Move ${person.name || 'advisor'} down`}
                              className="rounded p-1 text-charcoal-500 hover:bg-ivory-100 hover:text-charcoal-900 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <HiOutlineArrowDown className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={removePerson}
                              aria-label={`Remove ${person.name || 'advisor'}`}
                              className="rounded p-1 text-destructive hover:bg-destructive/10 ml-1"
                            >
                              <HiOutlineTrash className="size-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FormField
                            id={`person-name-${person.id}`}
                            label="Contact Name"
                            required
                          >
                            <Input
                              value={person.name}
                              onChange={(e) => updatePerson({ name: e.target.value })}
                              placeholder="e.g. Ajayraj"
                              required
                            />
                          </FormField>

                          <FormField
                            id={`person-phone-${person.id}`}
                            label="Phone Number"
                            hint="Clickable tel: and WhatsApp link"
                            required
                          >
                            <Input
                              type="tel"
                              value={person.phone}
                              onChange={(e) => updatePerson({ phone: e.target.value })}
                              placeholder="e.g. 8867725353"
                              required
                            />
                          </FormField>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </fieldset>

          {/* 4. Footer Social Links */}
          <fieldset className="space-y-4 border-t border-border pt-6">
            <legend className="text-heading-sm text-charcoal-900">
              Footer Social Links
            </legend>
            <p className="text-caption text-muted-foreground">
              Only enabled links with a valid URL appear in the website footer. Leave a URL
              empty to hide that icon.
            </p>

            {SOCIAL_PLATFORMS.map((platform) => {
              const Icon = socialIconMap[platform]
              const setting = form.social[platform]
              const urlError = validateSocialUrl(platform, setting.url)
              const { label, placeholder } = socialLabels[platform]

              const update = (patch: Partial<typeof setting>) =>
                setForm((current) => ({
                  ...current,
                  social: {
                    ...current.social,
                    [platform]: { ...current.social[platform], ...patch },
                  },
                }))

              return (
                <div
                  key={platform}
                  className="rounded-lg border border-border bg-ivory-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <span
                      className="hidden size-11 shrink-0 items-center justify-center rounded-md bg-charcoal-900 text-gold-400 sm:inline-flex"
                      aria-hidden
                    >
                      <Icon className="size-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <FormField
                        id={`settings-${platform}`}
                        label={label}
                        error={urlError ?? undefined}
                      >
                        <Input
                          type="url"
                          value={setting.url}
                          onChange={(event) => update({ url: event.target.value })}
                          placeholder={placeholder}
                          autoComplete="off"
                        />
                      </FormField>
                    </div>

                    <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-body-sm text-charcoal-800 sm:mt-7">
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={(event) => update({ enabled: event.target.checked })}
                        className="size-5 accent-gold-500"
                      />
                      <Icon className="size-4 sm:hidden" aria-hidden />
                      Show in footer
                    </label>
                  </div>
                </div>
              )
            })}
          </fieldset>

          {/* 5. Location */}
          <FormField id="settings-location" label="Location" required>
            <Textarea
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="1&2, Site 1, Khata 164P, Kommasandra, Sarjapura, Bengaluru, Bengaluru Urban, Karnataka - 562125, India"
              rows={3}
              required
            />
          </FormField>

          {error && (
            <p className="text-body-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-body-sm text-teak-700" role="status">
              {success}
            </p>
          )}

          <Button type="submit" variant="accent" isLoading={saving}>
            Save Settings
          </Button>
        </form>
      )}
    </div>
  )
}
