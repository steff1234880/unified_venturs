import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { PageLoader } from '@/components/layout/PageLoader'
import { RootLayout } from '@/components/layout'

const AdminAuthRoot = lazy(() =>
  import('@/admin/auth/AdminAuthRoot').then((module) => ({
    default: module.AdminAuthRoot,
  })),
)
const GuestRoute = lazy(() =>
  import('@/admin/auth/ProtectedRoute').then((module) => ({
    default: module.GuestRoute,
  })),
)
const ProtectedRoute = lazy(() =>
  import('@/admin/auth/ProtectedRoute').then((module) => ({
    default: module.ProtectedRoute,
  })),
)

const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage })),
)
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((module) => ({ default: module.ContactPage })),
)
const GalleryPage = lazy(() =>
  import('@/pages/GalleryPage').then((module) => ({ default: module.GalleryPage })),
)
const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage').then((module) => ({ default: module.ProjectsPage })),
)

const AdminLayout = lazy(() =>
  import('@/admin/layout/AdminLayout').then((module) => ({
    default: module.AdminLayout,
  })),
)
const AdminLoginPage = lazy(() =>
  import('@/admin/pages/LoginPage').then((module) => ({
    default: module.AdminLoginPage,
  })),
)
const AdminDashboardPage = lazy(() =>
  import('@/admin/pages/DashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const AdminProjectsPage = lazy(() =>
  import('@/admin/pages/ProjectsPage').then((module) => ({
    default: module.AdminProjectsPage,
  })),
)
const AdminGalleryPage = lazy(() =>
  import('@/admin/pages/GalleryPage').then((module) => ({
    default: module.AdminGalleryPage,
  })),
)
const AdminCraftsmanshipPage = lazy(() =>
  import('@/admin/pages/CraftsmanshipPage').then((module) => ({
    default: module.AdminCraftsmanshipPage,
  })),
)
const AdminServicesPage = lazy(() =>
  import('@/admin/pages/ServicesPage').then((module) => ({
    default: module.AdminServicesPage,
  })),
)
const AdminTestimonialsPage = lazy(() =>
  import('@/admin/pages/TestimonialsPage').then((module) => ({
    default: module.AdminTestimonialsPage,
  })),
)
const AdminFaqPage = lazy(() =>
  import('@/admin/pages/FaqPage').then((module) => ({
    default: module.AdminFaqPage,
  })),
)
const AdminMessagesPage = lazy(() =>
  import('@/admin/pages/MessagesPage').then((module) => ({
    default: module.AdminMessagesPage,
  })),
)
const AdminNotepadPage = lazy(() =>
  import('@/admin/pages/NotepadPage').then((module) => ({
    default: module.AdminNotepadPage,
  })),
)
const AdminInvoicesPage = lazy(() =>
  import('@/admin/pages/InvoicesPage').then((module) => ({
    default: module.AdminInvoicesPage,
  })),
)
const AdminSettingsPage = lazy(() =>
  import('@/admin/pages/SettingsPage').then((module) => ({
    default: module.AdminSettingsPage,
  })),
)
const AdminAccountPage = lazy(() =>
  import('@/admin/pages/AccountPage').then((module) => ({
    default: module.AdminAccountPage,
  })),
)

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'about', element: withSuspense(<AboutPage />) },
      { path: 'projects', element: withSuspense(<ProjectsPage />) },
      { path: 'gallery', element: withSuspense(<GalleryPage />) },
      { path: 'contact', element: withSuspense(<ContactPage />) },
    ],
  },
  {
    element: withSuspense(<AdminAuthRoot />),
    children: [
      {
        path: '/admin/login',
        element: withSuspense(<GuestRoute />),
        children: [{ index: true, element: withSuspense(<AdminLoginPage />) }],
      },
      {
        path: '/admin',
        element: withSuspense(<ProtectedRoute />),
        children: [
          {
            element: withSuspense(<AdminLayout />),
            children: [
              { index: true, element: withSuspense(<AdminDashboardPage />) },
              { path: 'invoices', element: withSuspense(<AdminInvoicesPage />) },
              { path: 'notepad', element: withSuspense(<AdminNotepadPage />) },
              { path: 'projects', element: withSuspense(<AdminProjectsPage />) },
              { path: 'gallery', element: withSuspense(<AdminGalleryPage />) },
              { path: 'craftsmanship', element: withSuspense(<AdminCraftsmanshipPage />) },
              { path: 'services', element: withSuspense(<AdminServicesPage />) },
              { path: 'testimonials', element: withSuspense(<AdminTestimonialsPage />) },
              { path: 'faq', element: withSuspense(<AdminFaqPage />) },
              { path: 'messages', element: withSuspense(<AdminMessagesPage />) },
              { path: 'settings', element: withSuspense(<AdminSettingsPage />) },
              { path: 'account', element: withSuspense(<AdminAccountPage />) },
            ],
          },
        ],
      },
    ],
  },
])
