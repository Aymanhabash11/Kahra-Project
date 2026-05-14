import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { seedFromJson } from '../../lib/utils'

interface Stats {
  products: number
  designers: number
  posts: number
  subscribers: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, designers: 0, posts: 0, subscribers: 0 })
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{ products: number; designers: number } | null>(null)

  useEffect(() => {
    async function fetchStats() {
      const [p, d, j, s] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('designers').select('*', { count: 'exact', head: true }),
        supabase.from('journal_posts').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        products: p.count ?? 0,
        designers: d.count ?? 0,
        posts: j.count ?? 0,
        subscribers: s.count ?? 0,
      })
    }
    fetchStats()
  }, [seedResult])

  async function handleSeed() {
    setSeeding(true)
    const result = await seedFromJson()
    setSeedResult(result)
    setSeeding(false)
  }

  const STATS = [
    { label: 'Products',       value: stats.products,    sub: 'in store' },
    { label: 'Designers',      value: stats.designers,   sub: 'curated' },
    { label: 'Journal Posts',  value: stats.posts,       sub: 'published' },
    { label: 'Subscribers',    value: stats.subscribers, sub: 'newsletter' },
  ]

  const QUICK = [
    { label: 'Add Product',         href: '/admin/products' },
    { label: 'Add Designer',        href: '/admin/designers' },
    { label: 'Write Journal Post',  href: '/admin/journal' },
    { label: 'View Reports',        href: '/admin/reports' },
  ]

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your store</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {STATS.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-accent" />
            <div className="admin-stat-label">{s.label}</div>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-seed-section">
        <div className="admin-seed-title">Import from JSON</div>
        <p className="admin-seed-desc">
          Seed the database from <code>products_collection.json</code> and <code>designers_clean.json</code>.
          Safe to run multiple times — uses upsert. After seeding, manage everything through the admin panel.
        </p>
        <button className="admin-seed-btn" onClick={handleSeed} disabled={seeding}>
          {seeding ? 'Importing…' : 'Import from JSON Files'}
        </button>
        {seedResult && (
          <p style={{ marginTop: '1rem', fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: '#27ae60', fontWeight: 300 }}>
            ✓ Imported {seedResult.products} products and {seedResult.designers} designers.
          </p>
        )}
      </div>

      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="admin-quick-actions-row">
          {QUICK.map(a => (
            <a key={a.label} href={a.href} className="admin-add-btn">{a.label}</a>
          ))}
        </div>
      </div>
    </>
  )
}
