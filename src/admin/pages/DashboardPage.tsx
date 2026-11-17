import { Link } from 'react-router-dom'

import { PageHeader, StatCard } from '@/admin/components/PageHeader'
import { useAdminCollection, useDashboardStats } from '@/admin/hooks/useAdminData'
import { formatDate } from '@/admin/utils'

export function AdminDashboardPage() {
  const stats = useDashboardStats()
  const { items: messages } = useAdminCollection('messages')
  const recentMessages = [...messages]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your site content and enquiries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Projects" value={stats.projects} />
        <StatCard label="Gallery Items" value={stats.gallery} />
        <StatCard label="Services" value={stats.services} />
        <StatCard label="Testimonials" value={stats.testimonials} />
        <StatCard label="FAQs" value={stats.faqs} />
        <StatCard
          label="Messages"
          value={stats.messages}
          hint={`${stats.unreadMessages} unread`}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-heading-md text-charcoal-900">Recent Messages</h2>
          <Link to="/admin/messages" className="text-body-sm text-teak-600 hover:text-gold-600">
            View all
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface-elevated p-6 text-body-sm text-muted-foreground">
            No contact messages yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className="rounded-xl border border-border bg-surface-elevated p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-body-sm font-medium text-charcoal-900">
                      {message.firstName} {message.lastName}
                    </p>
                    <p className="text-caption text-muted-foreground">{message.email}</p>
                  </div>
                  <span className="text-caption text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-body-sm text-muted-foreground">
                  {message.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
