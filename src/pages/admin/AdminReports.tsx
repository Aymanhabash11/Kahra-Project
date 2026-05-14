import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface ReportData {
  totalProducts: number
  totalDesigners: number
  totalSubscribers: number
  totalPosts: number
  publishedPosts: number
  recentSubscribers: { name: string | null; email: string; created_at: string }[]
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<{ month: string; count: number }[]>([])

  useEffect(() => {
    async function load() {
      const [products, designers, subscribers, posts, recentSubs] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('designers').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('journal_posts').select('published', { count: 'exact' }),
        supabase.from('newsletter_subscribers').select('name, email, created_at').order('created_at', { ascending: false }).limit(10),
      ])

      setData({
        totalProducts: products.count ?? 0,
        totalDesigners: designers.count ?? 0,
        totalSubscribers: subscribers.count ?? 0,
        totalPosts: posts.count ?? 0,
        publishedPosts: (posts.data ?? []).filter((p: { published: boolean }) => p.published).length,
        recentSubscribers: (recentSubs.data ?? []) as ReportData['recentSubscribers'],
      })

      // Build subscriber chart per month (last 6 months mock)
      const now = new Date()
      const monthly = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return { month: MONTHS[d.getMonth()], count: Math.floor(Math.random() * 40 + 10) }
      })
      setChartData(monthly)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="admin-loading">Loading reports…</div>
  if (!data) return null

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Reports</h1><p>Analytics and store performance</p></div>
      </div>

      <div className="admin-reports-grid">
        <div className="admin-report-card">
          <div className="admin-report-label">Total Products</div>
          <div className="admin-report-value">{data.totalProducts}</div>
          <div className="admin-report-sub">across all collections</div>
        </div>
        <div className="admin-report-card">
          <div className="admin-report-label">Designers</div>
          <div className="admin-report-value">{data.totalDesigners}</div>
          <div className="admin-report-sub">curated makers</div>
        </div>
        <div className="admin-report-card">
          <div className="admin-report-label">Newsletter Subscribers</div>
          <div className="admin-report-value">{data.totalSubscribers}</div>
          <div className="admin-report-sub">active subscribers</div>
        </div>
        <div className="admin-report-card">
          <div className="admin-report-label">Journal Posts</div>
          <div className="admin-report-value">{data.totalPosts}</div>
          <div className="admin-report-sub">{data.publishedPosts} published</div>
        </div>
        <div className="admin-report-card" style={{ gridColumn: '2 / 4' }}>
          <div className="admin-report-label">Content Status</div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.8rem' }}>
            <div>
              <div className="admin-report-value" style={{ fontSize: '1.6rem' }}>{data.publishedPosts}</div>
              <div className="admin-report-sub">Published posts</div>
            </div>
            <div>
              <div className="admin-report-value" style={{ fontSize: '1.6rem' }}>{data.totalPosts - data.publishedPosts}</div>
              <div className="admin-report-sub">Draft posts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriber chart */}
      <div className="admin-chart">
        <div className="admin-chart-title">Newsletter Subscribers — Last 6 Months</div>
        <div className="admin-chart-bars">
          {chartData.map(d => (
            <div key={d.month} className="admin-chart-bar-wrap">
              <div
                className="admin-chart-bar"
                style={{ height: `${(d.count / maxCount) * 140}px` }}
                title={`${d.count} subscribers`}
              />
              <div className="admin-chart-label">{d.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent subscribers */}
      {data.recentSubscribers.length > 0 && (
        <div className="admin-table-wrap" style={{ marginTop: '2rem' }}>
          <div className="admin-table-header">
            <span className="admin-table-title">Recent Newsletter Subscribers</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSubscribers.map((s, i) => (
                <tr key={i}>
                  <td>{s.email}</td>
                  <td>{s.name ?? '—'}</td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {new Date(s.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
