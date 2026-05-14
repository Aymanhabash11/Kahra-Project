import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import SearchOverlay from './SearchOverlay'
import '../styles/navbar.css'

const COL_GROUPS = [
  {
    title: 'Clothing',
    items: [
      { key: 'dresses',       label: 'Dresses' },
      { key: 'tops',          label: 'Tops' },
      { key: 'skirts',        label: 'Skirts' },
      { key: 'trousers',      label: 'Trousers' },
      { key: 'shorts',        label: 'Shorts' },
      { key: 'kimonos',       label: 'Kimonos' },
      { key: 'coats-jackets', label: 'Coats & Jackets' },
      { key: 'knitwear',      label: 'Knitwear' },
    ],
  },
  {
    title: 'Accessories',
    items: [
      { key: 'accessories', label: 'Accessories & Bags' },
      { key: 'shoes',       label: 'Shoes' },
      { key: 'jewelry',     label: 'Jewelry' },
      { key: 'perfumes',    label: 'Perfumes' },
    ],
  },
  {
    title: 'Living',
    items: [
      { key: 'home',        label: 'Home' },
      { key: 'textiles',    label: 'Textiles' },
      { key: 'pets-corner', label: 'Pets Corner' },
      { key: 'games',       label: 'Games' },
    ],
  },
]


function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  )
}
function AccountIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function BagIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { itemCount, setCartOpen } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [scrolled, setScrolled]           = useState(false)
  const [colOpen, setColOpen]             = useState(false)
  const [desOpen, setDesOpen]             = useState(false)
  const [acctOpen, setAcctOpen]           = useState(false)
  const [searchOpen, setSearchOpen]       = useState(false)
  const [menuOpen, setMenuOpen]           = useState(false)
  const [mobileColOpen, setMobileColOpen] = useState(false)
  const [mobileDesOpen, setMobileDesOpen] = useState(false)
  const [designerNames, setDesignerNames] = useState<string[]>([])
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    supabase.from('designers').select('name').order('name').then(({ data }) => {
      if (data?.length) setDesignerNames(data.map((d: { name: string }) => d.name))
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setColOpen(false); setDesOpen(false); setAcctOpen(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function closeAll() { setColOpen(false); setDesOpen(false); setAcctOpen(false); setSearchOpen(false) }
  function closeMenu() { setMenuOpen(false); setMobileColOpen(false); setMobileDesOpen(false) }

  return (
    <>
      <nav ref={navRef} className={scrolled ? 'navbar scrolled' : 'navbar'}>

        {/* ── Logo ── */}
        <Link to="/" className="nav-logo" onClick={closeAll}>
          <img src="/profile.jpg" alt="House of Nomad Stories" className="nav-logo-img"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="nav-logo-name">House of Nomad Stories</span>
        </Link>

        {/* ── Centre links ── */}
        <ul className="nav-links">
          <li><Link to="/" className="nav-link" onClick={closeAll}>Home</Link></li>
          <li>
            <button
              type="button"
              className={`nav-link-btn${colOpen ? ' active' : ''}`}
              onClick={e => { e.stopPropagation(); setColOpen(o => !o); setDesOpen(false); setAcctOpen(false) }}
            >
              Collections
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`nav-link-btn${desOpen ? ' active' : ''}`}
              onClick={e => { e.stopPropagation(); setDesOpen(o => !o); setColOpen(false); setAcctOpen(false) }}
            >
              Designers
            </button>
          </li>
          <li><Link to="/journal"   className="nav-link" onClick={closeAll}>Journal</Link></li>
          <li><Link to="/our-story" className="nav-link" onClick={closeAll}>Our Story</Link></li>
        </ul>

        {/* ── Right icons ── */}
        <div className="nav-actions">
          {profile?.role === 'admin' && (
            <Link to="/admin/dashboard" className="nav-icon-btn nav-admin-text" onClick={closeAll}>Admin</Link>
          )}

          <button
            className={`nav-icon-btn${searchOpen ? ' active' : ''}`}
            aria-label="Search"
            onClick={e => { e.stopPropagation(); setSearchOpen(o => !o); setColOpen(false); setDesOpen(false); setAcctOpen(false) }}
          >
            <SearchIcon />
          </button>

          <div className="nav-acct-wrap">
            <button
              className={`nav-icon-btn${acctOpen ? ' active' : ''}`}
              aria-label="Account"
              onClick={e => { e.stopPropagation(); setAcctOpen(o => !o); setColOpen(false); setDesOpen(false) }}
            >
              <AccountIcon />
            </button>
            <div className={`acct-dropdown${acctOpen ? ' open' : ''}`}>
              {user ? (
                <>
                  <Link to="/profile" className="acct-link" onClick={closeAll}>Profile</Link>
                  <button className="acct-link"
                    onClick={() => {
                      signOut().then(() => {
                        navigate('/')
                        showToast('You have been signed out.', 'info')
                      })
                      closeAll()
                    }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"  className="acct-link" onClick={closeAll}>Login</Link>
                  <Link to="/signup" className="acct-link" onClick={closeAll}>Sign Up</Link>
                </>
              )}
            </div>
          </div>

          <button className="nav-icon-btn nav-cart-btn"
            onClick={() => { setCartOpen(true); closeAll() }} aria-label="Cart">
            <BagIcon />
            {itemCount > 0 && <span className="nav-cart-badge">{itemCount}</span>}
          </button>

          {/* Hamburger (mobile only) */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span /><span /><span />
          </button>
        </div>

        {/* ── Mega Menu — Collections ── */}
        <div className={`mega-menu${colOpen ? ' open' : ''}`}>
          <div className="mega-inner">
            {COL_GROUPS.map(group => (
              <div key={group.title} className="mega-col">
                <div className="mega-col-title">{group.title}</div>
                {group.items.map(c => (
                  <Link key={c.key} to={`/collection?category=${c.key}`}
                    className="mega-link" onClick={closeAll}>{c.label}</Link>
                ))}
              </div>
            ))}

            <div className="mega-col">
              <div className="mega-col-title">Designers</div>
              {designerNames.slice(0, 6).map(d => (
                <Link key={d} to={`/designers?designer=${encodeURIComponent(d)}`}
                  className="mega-link" onClick={closeAll}>{d}</Link>
              ))}
              <Link to="/designers" className="mega-link mega-view-all" onClick={closeAll}>
                View All →
              </Link>
            </div>

            <div className="mega-col">
              <div className="mega-col-title">Explore</div>
              <Link to="/collection" className="mega-link" onClick={closeAll}>All Products</Link>
              <Link to="/journal"    className="mega-link" onClick={closeAll}>Journal</Link>
              <Link to="/our-story"  className="mega-link" onClick={closeAll}>Our Story</Link>
            </div>

            <div className="mega-image">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=80"
                alt="Collection preview"
              />
            </div>
          </div>
        </div>

        {/* ── Mega Menu — Designers ── */}
        <div className={`mega-menu${desOpen ? ' open' : ''}`}>
          <div className="mega-inner des-layout">
            {Array.from({ length: 4 }, (_, i) => {
              const chunk = Math.ceil(designerNames.length / 4)
              return designerNames.slice(i * chunk, (i + 1) * chunk)
            }).map((col, i) => (
              <div key={i} className="mega-col">
                {col.map(d => (
                  <Link key={d} to={`/designers?designer=${encodeURIComponent(d)}`}
                    className="mega-link" onClick={closeAll}>{d}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>

      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile backdrop */}
      <div className={`mobile-menu-overlay${menuOpen ? ' open' : ''}`} onClick={closeMenu} />

      {/* Mobile drawer */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <img src="/profile.jpg" alt="" className="nav-logo-img"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="nav-logo-name">House of Nomad Stories</span>
          </Link>
          <button className="mobile-close" onClick={closeMenu} aria-label="Close">✕</button>
        </div>

        <nav className="mobile-nav">
          <button
            className="mobile-nav-link mobile-search-btn"
            onClick={() => { setSearchOpen(true); closeMenu() }}
            aria-label="Search"
          >
            <SearchIcon />
            Search
          </button>

          <Link to="/" className="mobile-nav-link" onClick={closeMenu}>Home</Link>

          <div className={`mobile-accordion${mobileColOpen ? ' open' : ''}`}>
            <button className="mobile-nav-link mobile-accordion-toggle"
              onClick={() => setMobileColOpen(o => !o)}>
              Collections <span className="mobile-chevron" />
            </button>
            <div className="mobile-accordion-body">
              {COL_GROUPS.map(group => (
                <div key={group.title}>
                  <div className="mobile-sub-group">{group.title}</div>
                  {group.items.map(c => (
                    <Link key={c.key} to={`/collection?category=${c.key}`}
                      className="mobile-sub-link" onClick={closeMenu}>{c.label}</Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={`mobile-accordion${mobileDesOpen ? ' open' : ''}`}>
            <button className="mobile-nav-link mobile-accordion-toggle"
              onClick={() => setMobileDesOpen(o => !o)}>
              Designers <span className="mobile-chevron" />
            </button>
            <div className="mobile-accordion-body">
              {designerNames.map(d => (
                <Link key={d} to={`/designers?designer=${encodeURIComponent(d)}`}
                  className="mobile-sub-link" onClick={closeMenu}>{d}</Link>
              ))}
            </div>
          </div>

          <Link to="/journal"   className="mobile-nav-link" onClick={closeMenu}>Journal</Link>
          <Link to="/our-story" className="mobile-nav-link" onClick={closeMenu}>Our Story</Link>
        </nav>

        <div className="mobile-menu-actions">
          {profile?.role === 'admin' && (
            <Link to="/admin/dashboard" className="mobile-nav-link mobile-admin-link" onClick={closeMenu}>Admin</Link>
          )}
          <button className="mobile-cart-btn" onClick={() => { setCartOpen(true); closeMenu() }}>
            <BagIcon /> Bag
            {itemCount > 0 && <span className="nav-cart-badge">{itemCount}</span>}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>Profile</Link>
              <button className="mobile-nav-link"
                onClick={() => {
                  signOut().then(() => {
                    navigate('/')
                    showToast('You have been signed out.', 'info')
                    closeMenu()
                  })
                }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="mobile-nav-link" onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="mobile-nav-link" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
