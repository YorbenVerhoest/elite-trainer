import { NavLink, Outlet, Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppLogo } from '@/components/AppLogo'
import { PageShell } from '@/components/PageShell'

// ─── Nav config — add future sections here ───────────────────────────────────
const NAV = [
  {
    to: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    to: 'history',
    label: 'History',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    to: 'programs',
    label: 'Programs',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="5" width="18" height="3" rx="1" />
        <rect x="3" y="11" width="18" height="3" rx="1" />
        <rect x="3" y="17" width="11" height="3" rx="1" />
      </svg>
    ),
  },
] as const

const NAV_LINK_BASE =
  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all'
const NAV_LINK_ACTIVE = 'bg-gray-800 text-white'
const NAV_LINK_INACTIVE = 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'

export function AccountPage() {
  const { signOut } = useAuth()
  const location = useLocation()
  const isRoot = location.pathname === '/account' || location.pathname === '/account/'

  // Redirect /account → /account/profile
  if (isRoot) return <Navigate to="/account/profile" replace />

  // Derive section title from active route for the mobile header
  const activeNav = NAV.find((n) => location.pathname.includes(n.to))

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8 animate-fade-up" style={{ animationFillMode: 'both' }}>

        {/* Page header */}
        <div className="flex items-center justify-between">
          <AppLogo title="Account" subtitle={activeNav?.label ?? 'Settings'} />

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Trainer
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar — vertical on desktop, horizontal pills on mobile */}
          <nav className="flex md:flex-col gap-1 shrink-0 md:w-44 overflow-x-auto pb-1 md:pb-0">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE} whitespace-nowrap`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0 bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </PageShell>
  )
}
