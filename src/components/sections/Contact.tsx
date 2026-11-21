import { useState, type FormEvent } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { HiOutlinePhone } from 'react-icons/hi'

import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from '@/components/ui'
import { useSectionReveal, useSiteSettings } from '@/hooks'
import { submitContactForm } from '@/lib/contact'
import { cn } from '@/utils'

import { buildHomeContactItems, buildHomeContactPersons } from './contact.items'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

const projectTypes = [
  'Full Residence',
  'Heritage Restoration',
  'Single Room',
  'Commercial Space',
] as const

export function Contact() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.14 })
  const siteSettings = useSiteSettings()
  const homeContactItems = buildHomeContactItems(siteSettings)
  const contactPersons = buildHomeContactPersons(siteSettings)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
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
    <SectionShell id="contact" ref={sectionRef} dark>
      <div className="ds-container relative">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeader
              overline="Begin Your Journey"
              title="Get in Touch"
              description="Share your vision with us. Our design concierge will respond within one business day."
              dark
            />

            {/* Email & Atelier general items */}
            <ul className="mt-8 space-y-3.5">
              {homeContactItems.map((item) => (
                <li key={item.label} data-reveal>
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'group -mx-2 flex items-start gap-4 rounded-lg p-2 transition-luxury',
                      'hover:bg-ivory-100/5 ds-focus-ring',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-md border',
                        'border-ivory-100/15 bg-charcoal-800 transition-luxury',
                        'group-hover:border-gold-400/50 group-hover:bg-charcoal-700',
                      )}
                    >
                      <item.icon
                        className="size-5 text-gold-400 transition-colors group-hover:text-gold-300"
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-overline text-gold-400">{item.label}</p>
                      <p className="mt-1 text-body-md text-ivory-100 transition-colors group-hover:text-ivory-50 break-words">
                        {item.value}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact Persons List */}
            {contactPersons.length > 0 && (
              <div data-reveal className="mt-8 border-t border-ivory-100/10 pt-6">
                <p className="text-overline text-gold-400">Direct Contact Advisors</p>
                <div className="mt-4 space-y-3">
                  {contactPersons.map((person) => (
                    <div
                      key={person.id}
                      className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-ivory-100/10 bg-charcoal-800/60 p-3.5 transition-luxury hover:border-gold-400/40 hover:bg-charcoal-800"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-medium text-ivory-50 group-hover:text-gold-300 transition-colors">
                          {person.name}
                        </p>
                        <a
                          href={person.phoneHref}
                          className="mt-0.5 inline-block text-body-xs text-ivory-100/70 hover:text-gold-400 transition-colors"
                        >
                          {person.phoneDisplay}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={person.phoneHref}
                          className="inline-flex items-center gap-1.5 rounded-md border border-ivory-100/20 bg-charcoal-700/80 px-3 py-1.5 text-caption font-medium text-ivory-100 transition-colors hover:border-gold-400 hover:text-gold-300 ds-focus-ring"
                          aria-label={`Call ${person.name} at ${person.phoneDisplay}`}
                        >
                          <HiOutlinePhone className="size-3.5 text-gold-400" aria-hidden />
                          <span>Call</span>
                        </a>

                        <a
                          href={person.whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600/40 bg-emerald-950/60 px-3 py-1.5 text-caption font-medium text-emerald-300 transition-colors hover:border-emerald-500 hover:bg-emerald-900/80 hover:text-white ds-focus-ring"
                          aria-label={`Chat with ${person.name} on WhatsApp`}
                        >
                          <FaWhatsapp className="size-3.5 text-emerald-400" aria-hidden />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div data-reveal>
            {submitted ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-xl border border-gold-400/30 bg-charcoal-800/50 p-6 sm:p-8 text-center">
                <p className="font-display text-display-sm text-ivory-50">Thank You</p>
                <p className="mt-4 max-w-sm text-body-md text-ivory-100/75">
                  Your enquiry has been received. Our team will be in touch shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-ivory-100/10 bg-charcoal-800/40 p-5 sm:p-6 backdrop-blur-sm md:p-8 [&_label]:text-gold-400"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField id="first-name" label="First Name" required>
                    <Input name="firstName" placeholder="Ananya" required />
                  </FormField>
                  <FormField id="last-name" label="Last Name" required>
                    <Input name="lastName" placeholder="Sharma" required />
                  </FormField>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <FormField id="email" label="Email" required>
                    <Input name="email" type="email" placeholder="you@email.com" required />
                  </FormField>
                  <FormField id="phone" label="Phone">
                    <Input name="phone" type="tel" placeholder="+91 98765 43210" />
                  </FormField>
                </div>

                <FormField id="project-type" label="Project Type" className="mt-5">
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
                  id="message"
                  label="Tell Us About Your Project"
                  className="mt-5"
                  required
                >
                  <Textarea
                    name="message"
                    placeholder="Describe your space, timeline, and design aspirations..."
                    rows={4}
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
        </div>
      </div>
    </SectionShell>
  )
}
