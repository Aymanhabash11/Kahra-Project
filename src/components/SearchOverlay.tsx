import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProducts, loadDesigners } from '../lib/utils'
import type { Product, Designer } from '../lib/types'
import '../styles/search.css'

interface Props {
  open: boolean
  onClose: () => void
}

const CATEGORIES = [
  { key: 'accessories',   label: 'Accessories & Bags' },
  { key: 'dresses',       label: 'Dresses' },
  { key: 'coats-jackets', label: 'Coats & Jackets' },
  { key: 'games',         label: 'Games' },
  { key: 'home',          label: 'Home' },
  { key: 'kimonos',       label: 'Kimonos' },
  { key: 'knitwear',      label: 'Knitwear' },
  { key: 'jewelry',       label: 'Jewelry' },
  { key: 'perfumes',      label: 'Perfumes' },
  { key: 'skirts',        label: 'Skirts' },
  { key: 'shoes',         label: 'Shoes' },
  { key: 'shorts',        label: 'Shorts' },
  { key: 'pets-corner',   label: 'Pets Corner' },
  { key: 'textiles',      label: 'Textiles' },
  { key: 'tops',          label: 'Tops' },
  { key: 'trousers',      label: 'Trousers' },
]

const POPULAR = ['Dresses', 'Kimonos', 'Accessories', 'Marrakshi Life', 'Olivia Dar', 'Jewelry']

export default function SearchOverlay({ open, onClose }: Props) {
  const navigate = useNavigate()
  const inputRef  = useRef<HTMLInputElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)

  const [query, setQuery]         = useState('')
  const [products, setProducts]   = useState<Product[]>([])
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loaded, setLoaded]       = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(-1)

  // Load all data once
  useEffect(() => {
    if (open && !loaded) {
      Promise.all([loadProducts(), loadDesigners()]).then(([prods, des]) => {
        setProducts(prods)
        setDesigners(des)
        setLoaded(true)
      })
    }
    if (open) {
      setQuery('')
      setFocusedIdx(-1)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  // Reset focus when query changes
  useEffect(() => { setFocusedIdx(-1) }, [query])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIdx < 0) return
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${focusedIdx}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [focusedIdx])

  const q = query.toLowerCase().trim()
  const hasQuery = q.length >= 2

  const matchedCategories = useMemo(() =>
    !hasQuery ? [] : CATEGORIES.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.key.replace(/-/g, ' ').includes(q)
    ).slice(0, 3),
  [q, hasQuery])

  const matchedDesigners = useMemo(() =>
    !hasQuery ? [] : designers
      .filter(d => d.name.toLowerCase().includes(q))
      .slice(0, 4),
  [q, hasQuery, designers])

  const matchedProducts = useMemo(() =>
    !hasQuery ? [] : products
      .filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.vendor ?? '').toLowerCase().includes(q) ||
        (p.collection ?? '').replace(/-/g, ' ').includes(q)
      )
      .slice(0, 6),
  [q, hasQuery, products])

  // Flat list of paths for keyboard navigation
  const flatPaths = useMemo(() => [
    ...matchedCategories.map(c => `/collection?category=${c.key}`),
    ...matchedDesigners.map(d => `/designers?designer=${encodeURIComponent(d.name)}`),
    ...matchedProducts.map(p => `/product/${p.handle}`),
  ], [matchedCategories, matchedDesigners, matchedProducts])

  const hasResults = flatPaths.length > 0

  function go(path: string) {
    navigate(path)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!hasQuery || flatPaths.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIdx(i => Math.min(i + 1, flatPaths.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const idx = focusedIdx >= 0 ? focusedIdx : 0
      if (flatPaths[idx]) go(flatPaths[idx])
    }
  }

  // Pre-compute absolute indices for each section
  const catOffset = 0
  const desOffset = matchedCategories.length
  const prdOffset = matchedCategories.length + matchedDesigners.length

  return (
    <>
      <div className={`search-backdrop${open ? ' open' : ''}`} onClick={onClose} />

      <div ref={panelRef} className={`search-panel${open ? ' open' : ''}`}
        onClick={e => e.stopPropagation()}>

        {/* ── Input row ── */}
        <div className="search-input-row">
          <svg className="search-icon-sm" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search collections, designers, products…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="search-clear-btn"
              onClick={() => { setQuery(''); inputRef.current?.focus() }}>✕</button>
          )}
          <button className="search-close-btn" onClick={onClose}>Close</button>
        </div>

        {/* ── Results ── */}
        {hasQuery && (
          <div className="search-results">
            {!hasResults && (
              <p className="search-empty">No results for "<em>{query}</em>"</p>
            )}

            {/* Collections */}
            {matchedCategories.length > 0 && (
              <div className="search-section">
                <div className="search-section-label">Collections</div>
                {matchedCategories.map((c, i) => {
                  const idx = catOffset + i
                  return (
                    <button key={c.key} data-idx={idx}
                      className={`search-result${focusedIdx === idx ? ' focused' : ''}`}
                      onClick={() => go(`/collection?category=${c.key}`)}>
                      <div className="search-result-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                      </div>
                      <div className="search-result-body">
                        <div className="search-result-title">{c.label}</div>
                        <div className="search-result-meta"><span>Browse collection</span></div>
                      </div>
                      <svg className="search-result-arrow" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Designers */}
            {matchedDesigners.length > 0 && (
              <div className="search-section">
                <div className="search-section-label">Designers</div>
                {matchedDesigners.map((d, i) => {
                  const idx = desOffset + i
                  return (
                    <button key={d.id} data-idx={idx}
                      className={`search-result${focusedIdx === idx ? ' focused' : ''}`}
                      onClick={() => go(`/designers?designer=${encodeURIComponent(d.name)}`)}>
                      <div className="search-result-img search-result-img--round">
                        {d.image_url
                          ? <img src={d.image_url} alt={d.name} />
                          : <span className="search-result-initial">{d.name[0]}</span>}
                      </div>
                      <div className="search-result-body">
                        <div className="search-result-title">{d.name}</div>
                        {d.origin && (
                          <div className="search-result-meta"><span>{d.origin}</span></div>
                        )}
                      </div>
                      <svg className="search-result-arrow" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Products */}
            {matchedProducts.length > 0 && (
              <div className="search-section">
                <div className="search-section-label">Products</div>
                {matchedProducts.map((p, i) => {
                  const idx = prdOffset + i
                  return (
                    <button key={p.id} data-idx={idx}
                      className={`search-result${focusedIdx === idx ? ' focused' : ''}`}
                      onClick={() => go(`/product/${p.handle}`)}>
                      <div className="search-result-img">
                        <img src={p.image_url} alt={p.title} />
                      </div>
                      <div className="search-result-body">
                        <div className="search-result-title">{p.title}</div>
                        <div className="search-result-meta">
                          {p.vendor && <span>{p.vendor}</span>}
                          <span>${Number(p.price).toFixed(0)}</span>
                        </div>
                      </div>
                      <svg className="search-result-arrow" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            )}
            {hasResults && (
              <div className="search-kbd-hint">
                <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                <span><kbd>↵</kbd> Open</span>
                <span><kbd>Esc</kbd> Close</span>
              </div>
            )}
          </div>
        )}

        {/* ── Popular (idle) ── */}
        {!hasQuery && (
          <div className="search-popular">
            <div className="search-section-label">Popular searches</div>
            <div className="search-pills">
              {POPULAR.map(s => (
                <button key={s} className="search-pill"
                  onClick={() => { setQuery(s); inputRef.current?.focus() }}>{s}</button>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
