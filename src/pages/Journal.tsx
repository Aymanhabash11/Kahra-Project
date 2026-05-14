import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { JournalPost } from '../lib/types'
import { JOURNAL_CATEGORIES } from '../lib/utils'
import '../styles/journal.css'

const MOCK_POSTS: JournalPost[] = [
  { id: '1', title: 'The Architecture of Belonging: Inside HONS Home', slug: 'hons-home-architecture', excerpt: 'How limewashed plaster, terracotta tile, and arched niches create a retail space that feels more like a home than a store — and why that distinction matters.', cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=70', category: 'Concept Stories', author: 'KAHRA Studio Group', published: true, published_at: '2026-04-18' },
  { id: '2', title: 'Shura Island: Building a Destination from the Sea', slug: 'shura-island', excerpt: 'Foster + Partners designed an island. KAHRA designed the retail soul within it. A conversation on what luxury means when the setting is extraordinary.', cover_image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=70', category: 'Destinations', author: 'KAHRA Studio Group', published: true, published_at: '2026-03-30' },
  { id: '3', title: 'Saudi Craftsmanship and the Art of Slow Retail', slug: 'saudi-craft-slow-retail', excerpt: 'The Foundry concept was born from a belief: that the next great wave of luxury craftsmanship may well emerge from the Kingdom. A story of makers and materials.', cover_image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=70', category: 'Craft & Culture', author: 'KAHRA Studio Group', published: true, published_at: '2026-03-10' },
  { id: '4', title: 'Karin Kämpf: Forty Years, One Philosophy', slug: 'karin-kampf', excerpt: 'From the ateliers of Fendi to the beaches of AMAALA — a conversation with KAHRA\'s co-founder about sustainability, beauty, and why luxury must earn its name.', cover_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=70', category: 'Founder Portraits', author: 'KAHRA Studio Group', published: true, published_at: '2026-02-20' },
  { id: '5', title: 'Ultraviolet: The Frame as Sculpture', slug: 'ultraviolet-frames', excerpt: 'Linda Farrow, Jacques Marie Mage, Kuboraum — how KAHRA\'s sunglass concept became a gallery for the world\'s most considered eyewear.', cover_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=70', category: 'Concept Stories', author: 'KAHRA Studio Group', published: true, published_at: '2026-02-05' },
  { id: '6', title: 'Vision 2030 and the New Geography of Luxury', slug: 'vision-2030-luxury', excerpt: 'Saudi Arabia is rewriting the map of global tourism. KAHRA\'s role within AMAALA and Shura Island places it at the centre of this transformation.', cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70', category: 'Destinations', author: 'KAHRA Studio Group', published: true, published_at: '2026-01-22' },
]

export default function Journal() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<JournalPost[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [nlEmail, setNlEmail] = useState('')
  const [nlSent, setNlSent] = useState(false)

  useEffect(() => {
    supabase
      .from('journal_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data && data.length > 0 ? (data as JournalPost[]) : MOCK_POSTS)
      })
  }, [])

  const featured = posts[0]
  const rest = posts.slice(1)

  const filtered = activeCategory === 'All'
    ? rest
    : rest.filter(p => p.category === activeCategory)

  async function handleNl(e: React.FormEvent) {
    e.preventDefault()
    if (!nlEmail) return
    await supabase.from('newsletter_subscribers').upsert({ email: nlEmail }, { onConflict: 'email' })
    setNlSent(true)
  }

  return (
    <>
      <div className="journal-header">
        <div className="journal-header-left">
          <span className="section-label">The KAHRA Journal</span>
          <h1>Stories from<br /><em>three destinations</em></h1>
        </div>
        <p className="journal-header-desc">
          Concept stories, founder portraits, maker dispatches, and notes
          from the intersection of Saudi craftsmanship and international luxury.
        </p>
      </div>

      {featured && (
        <div className="journal-featured">
          <div className="featured-image" onClick={() => navigate(`/journal/${featured.slug}`)}>
            {featured.cover_image && <img src={featured.cover_image} alt={featured.title} />}
            {featured.category && <span className="featured-tag">{featured.category}</span>}
          </div>
          <div className="featured-text">
            <div className="featured-meta">
              {featured.author} · {featured.published_at ? new Date(featured.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </div>
            <h2 className="featured-title" onClick={() => navigate(`/journal/${featured.slug}`)}>
              {featured.title}
            </h2>
            {featured.excerpt && <p className="featured-excerpt">{featured.excerpt}</p>}
            <button className="read-more" onClick={() => navigate(`/journal/${featured.slug}`)}>
              Read Story →
            </button>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-label">Topics</div>
        <div className="filter-pills">
          {JOURNAL_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`pill${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className="journal-body">
        <div className="posts-grid">
          {filtered.map(post => (
            <div key={post.id} className="post-card" onClick={() => navigate(`/journal/${post.slug}`)}>
              <div className="post-image">
                {post.cover_image && <img src={post.cover_image} alt={post.title} loading="lazy" />}
                {post.category && <span className="post-category">{post.category}</span>}
              </div>
              <div className="post-body">
                <div className="post-meta">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </div>
                <h3 className="post-title">{post.title}</h3>
                {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="journal-newsletter">
        <h2>Letters from<br /><em>Shura, AMAALA & Riyadh</em></h2>
        <p>Concept launches, maker portraits, destination dispatches — subscribe to receive the KAHRA editorial directly.</p>
        {nlSent ? (
          <p style={{ color: 'var(--sand)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.1rem' }}>
            Thank you — we'll be in touch.
          </p>
        ) : (
          <form className="nl-form" onSubmit={handleNl}>
            <input className="nl-input" type="email" placeholder="Your email address" required value={nlEmail} onChange={e => setNlEmail(e.target.value)} />
            <button type="submit" className="nl-btn">Subscribe →</button>
          </form>
        )}
      </div>
    </>
  )
}
