import { useState, type FormEvent } from 'react'
import {
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
} from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'

import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from '@/components/ui'
import { getMapsHref, getTelHref } from '@/config/contact'
import { env } from '@/config/env'
import { useSectionReveal, useSiteSettings } from '@/hooks'
import { submitContactForm } from '@/lib/contact'
import { getContactDetailsFromSettings } from '@/lib/site-settings'
import { cn } from '@/utils'

import { contactFaqs, offices } from './data/contact.data'

const projectTypes = [
  'Full Residence',
  'Heritage Restoration',
  'Single Room',
  'Commercial Space',
] as const

export function ContactPage() {
  const pageRef = useSectionReveal<HTMLElement>({ stagger: 0.12 })
  const siteSettings = useSiteSettings()
  const contact = getContactDetailsFromSettings(siteSettings)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setLoading(true)
    setError(null)

    try {
      await submitContactForm({
        firstName: String(data.get('firstName') ?? ''),
        lastName: String(data.get('lastName') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        projectType: String(data.get('projectType') ?? ''),
        message: String(data.get('message') ?? ''),
      })

      setSubmitted(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main ref={pageRef} className="min-h-screen bg-ivory-50">
      {/* Centered airy header — light, not dark */}
      <header className="border-b border-border px-6 pt-32 pb-16 text-center md:pt-36 md:pb-20">
        <p data-reveal className="text-overline text-gold-600">
          Get in Touch
        </p>
        <h1
          data-reveal
          className="mx-auto mt-4 max-w-2xl font-display text-display-lg text-charcoal-900"
        >
          We&apos;d love to hear about your project
        </h1>
        <p
          data-reveal
          className="mx-auto mt-6 max-w-lg text-body-lg text-muted-foreground"
        >
          Whether you&apos;re planning a full residence or exploring possibilities,
          our design concierge is here to guide you.
        </p>
      </header>

      {/* Office cards row */}
      <section className="border-b border-border py-14 md:py-16">
        <div className="ds-container">
          <div className="max-w-2xl mx-auto">
            {offices.map((office, index) => (
              <div
                key={office.city}
                data-reveal
                className="group rounded-md sm:rounded-lg border border-border/80 bg-surface-elevated/95 p-6 sm:p-8 shadow-xs hover:border-gold-400 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <p className="text-[10px] sm:text-overline tracking-widest uppercase font-medium text-gold-600">
                      Official Studio Atelier
                    </p>
                    <h3 className="mt-0.5 font-display text-heading-md text-charcoal-900 transition-colors">
                      {office.city}
                    </h3>
                  </div>
                  <span className="flex size-7 items-center justify-center rounded-xs border border-border bg-ivory-100/70 font-mono text-[11px] font-medium text-charcoal-700">
                    0{index + 1}
                  </span>
                </div>

                <ul className="mt-4 space-y-3">
                  <li>
                    <a
                      href={getMapsHref(office.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-body-xs sm:text-body-sm text-charcoal-800 transition-colors hover:text-charcoal-950 ds-focus-ring py-0.5"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm border border-border bg-ivory-100/70 text-charcoal-700">
                        <HiOutlineLocationMarker className="size-3.5" aria-hidden />
                      </span>
                      <span>{office.address}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={getTelHref(office.phone)}
                      className="flex items-center gap-3 text-body-xs sm:text-body-sm text-charcoal-800 transition-colors hover:text-charcoal-950 ds-focus-ring py-0.5"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-border bg-ivory-100/70 text-charcoal-700">
                        <HiOutlinePhone className="size-3.5" aria-hidden />
                      </span>
                      <span>{office.phone}</span>
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-body-xs sm:text-body-sm text-muted-foreground py-0.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-border/70 bg-surface text-stone-500">
                      <HiOutlineClock className="size-3.5" aria-hidden />
                    </span>
                    <span>{office.hours}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + sidebar layout */}
      <section className="ds-section">
        <div className="ds-container">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            <div data-reveal className="lg:col-span-3">
              {submitted ? (
                <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-gold-300 bg-surface-elevated p-12 text-center shadow-md">
                  <p className="font-display text-display-sm text-charcoal-900">
                    Thank You
                  </p>
                  <p className="mt-4 max-w-sm text-body-md text-muted-foreground">
                    Your enquiry has been received. We&apos;ll respond within one
                    business day.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-md sm:rounded-lg border border-border bg-surface-elevated p-5 sm:p-6 md:p-10 shadow-xs"
                >
                  <h2 className="font-display text-display-sm text-charcoal-900">
                    Send an Enquiry
                  </h2>
                  <p className="mt-2 text-body-sm text-muted-foreground">
                    Fields marked with * are required.
                  </p>

                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <FormField id="contact-first" label="First Name" required>
                      <Input name="firstName" placeholder="Ananya" required />
                    </FormField>
                    <FormField id="contact-last" label="Last Name" required>
                      <Input name="lastName" placeholder="Sharma" required />
                    </FormField>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <FormField id="contact-email" label="Email" required>
                      <Input
                        name="email"
                        type="email"
                        placeholder={`hello@${env.appName}.com`}
                        required
                      />
                    </FormField>
                    <FormField id="contact-phone" label="Phone">
                      <Input name="phone" type="tel" placeholder="+91 98765 43210" />
                    </FormField>
                  </div>

                  <FormField id="contact-type" label="Project Type" className="mt-5">
                    <Select name="projectType" defaultValue="" className="text-charcoal-900">
                      <option value="" disabled className="text-charcoal-500">
                        Select a type
                      </option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type} className="text-charcoal-900">
                          {type}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField
                    id="contact-message"
                    label="Tell Us About Your Project"
                    className="mt-5"
                    required
                  >
                    <Textarea
                      name="message"
                      placeholder="Share your vision, location, and timeline..."
                      rows={5}
                      required
                    />
                  </FormField>

                  <Button type="submit" variant="primary" size="lg" className="mt-8 w-fit max-w-full sm:w-auto" isLoading={loading}>
                    Send Enquiry
                  </Button>
                  {error && (
                    <p className="mt-4 text-body-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}
                </form>
              )}
            </div>

            <aside className="lg:col-span-2">
              <div data-reveal className="sticky top-28 space-y-6 sm:space-y-8">
                <div className="rounded-md sm:rounded-lg border border-charcoal-800 bg-charcoal-900 p-5 sm:p-7 text-ivory-50 shadow-sm">
                  <p className="text-[10px] sm:text-overline tracking-widest uppercase font-medium text-gold-400">
                    Design Concierge
                  </p>
                  <h3 className="mt-1 font-display text-heading-md text-ivory-50">
                    Direct Contact & Inquiries
                  </h3>
                  <div className="my-3 h-px w-8 bg-gold-400/40" aria-hidden />

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gold-400/80 font-mono">Email</span>
                    <a
                      href={contact.mailtoHref}
                      className="mt-1 flex items-center gap-2.5 text-body-sm break-all text-ivory-100/90 transition-colors hover:text-gold-400 ds-focus-ring py-0.5"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-xs border border-white/15 bg-white/10 text-gold-400">
                        <HiOutlineMail className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 break-all">{contact.email}</span>
                    </a>
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-4">
                    <span className="text-[10px] uppercase tracking-wider text-gold-400/80 font-mono">Direct Advisors</span>
                    <div className="mt-2.5 space-y-2.5">
                      {contact.contactPersons.map((person) => {
                        const digits = person.phone.replace(/\D/g, '')
                        const fullDigits = digits.length === 10 ? `91${digits}` : digits
                        const waUrl = `https://wa.me/${fullDigits}?text=${encodeURIComponent(`Hello ${person.name}, I would like to enquire about your interior design services.`)}`

                        return (
                          <div
                            key={person.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded border border-white/10 bg-charcoal-800/70 p-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-body-xs font-medium text-ivory-100">{person.name}</p>
                              <a
                                href={`tel:${digits}`}
                                className="text-caption text-ivory-100/70 hover:text-gold-400 transition-colors"
                              >
                                {person.phone}
                              </a>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={`tel:${digits}`}
                                className="inline-flex items-center gap-1 rounded border border-white/20 bg-charcoal-700 px-2 py-1 text-caption text-ivory-100 hover:border-gold-400 hover:text-gold-300"
                                aria-label={`Call ${person.name}`}
                              >
                                <HiOutlinePhone className="size-3 text-gold-400" />
                                <span>Call</span>
                              </a>
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-emerald-600/50 bg-emerald-950/70 px-2 py-1 text-caption text-emerald-300 hover:text-white hover:bg-emerald-900"
                                aria-label={`WhatsApp ${person.name}`}
                              >
                                <FaWhatsapp className="size-3 text-emerald-400" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-heading-sm font-display text-charcoal-900">
                    Common Inquiries
                  </h3>
                  <div className="mt-3 space-y-2">
                    {contactFaqs.map((faq, index) => {
                      const isOpen = openFaq === index
                      const panelId = `contact-faq-panel-${index}`
                      const buttonId = `contact-faq-button-${index}`

                      return (
                        <div
                          key={faq.question}
                          data-reveal
                          className="overflow-hidden rounded-md border border-border/80 bg-surface-elevated/95 shadow-xs transition-colors hover:border-gold-400"
                        >
                          <button
                            id={buttonId}
                            type="button"
                            onClick={() => setOpenFaq(isOpen ? null : index)}
                            className="flex w-full items-center justify-between gap-4 p-3.5 sm:p-4 text-left text-body-xs sm:text-body-sm font-medium text-charcoal-900 ds-focus-ring active:bg-ivory-50/60"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                          >
                            <span>{faq.question}</span>
                            <span
                              className={cn(
                                'text-gold-500 font-mono text-base transition-transform duration-300',
                                isOpen && 'rotate-45',
                              )}
                              aria-hidden
                            >
                              +
                            </span>
                          </button>
                          {isOpen && (
                            <p
                              id={panelId}
                              role="region"
                              aria-labelledby={buttonId}
                              className="border-t border-border/60 px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2.5 text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed"
                            >
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div
                  data-reveal
                  className="flex flex-col items-center justify-center rounded-md sm:rounded-lg border border-border/80 bg-surface-elevated/80 p-6 text-center shadow-xs"
                >
                  <div className="flex size-10 items-center justify-center rounded-xs border border-border bg-ivory-100/70 text-charcoal-800 shadow-xs mb-2">
                    <HiOutlineLocationMarker className="size-5" aria-hidden />
                  </div>
                  <p className="font-display text-heading-sm text-charcoal-900">Studio Atelier</p>
                  <p className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase mt-1">
                    Bengaluru, Karnataka, India
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
