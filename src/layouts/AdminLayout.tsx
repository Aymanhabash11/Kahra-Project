import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/admin.css'

const NAV_ITEMS = [
  {
    to: '/admin/dashboard', label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: '/admin/products', label: 'Products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      </svg>
    ),
  },
  {
    to: '/admin/designers', label: 'Designers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    to: '/admin/journal', label: 'Journal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    to: '/admin/reports', label: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
]

const PAGE_NAMES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products':  'Products',
  '/admin/designers': 'Designers',
  '/admin/journal':   'Journal',
  '/admin/reports':   'Reports',
}

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const pageTitle = PAGE_NAMES[pathname] ?? 'Admin'
  const initials  = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (profile?.email?.[0] ?? 'A').toUpperCase()

  return (
    <div className="admin-layout">

      {/* Mobile sidebar overlay */}
      <div
        className={`admin-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div>
            <a href="/" className="admin-sidebar-brand">House of Nomad Stories</a>
            <div className="admin-sidebar-sub">Admin Panel</div>
          </div>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >✕</button>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">Menu</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="admin-nav-section">Account</div>
          <button
            className="admin-nav-link"
            onClick={() => signOut().then(() => navigate('/'))}
          >
            <span className="admin-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            Sign Out
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="admin-back-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Store
          </a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              <span /><span /><span />
            </button>
            <span className="admin-topbar-page">{pageTitle}</span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-user-avatar">{initials}</div>
            <div className="admin-user-details">
              <span className="admin-user-name">{profile?.full_name ?? profile?.email ?? 'Admin'}</span>
              <span className="admin-user-role">{profile?.role ?? 'admin'}</span>
            </div>
          </div>
        </header>

        <main className="admin-body">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
