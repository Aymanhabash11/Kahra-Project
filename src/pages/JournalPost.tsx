import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { JournalPost } from '../lib/types'
import '../styles/journal.css'

const MOCK: Record<string, JournalPost> = {
  'injiri-poetry-imperfection': { id: '1', title: 'Injiri and the Poetry of Imperfection', slug: 'injiri-poetry-imperfection', excerpt: 'Inside the Jaipur studio of Chinar Farooqui, where every thread is a deliberate act of remembrance.', content: `<p>In a quiet workshop in the old city of Jaipur, surrounded by towers of hand-dyed thread, Chinar Farooqui is considering a single length of fabric. The cotton was handwoven on a pit loom by a master weaver named Govind, who has been practising his craft for forty years. A small irregularity in the weave — a slight variation in the tension of one thread — catches the afternoon light.</p><p>"That," says Chinar, pointing to it, "is the most important part of this piece." He is not being ironic. For Chinar, the irregularities are the point. They are the signature of the human hand, the evidence that this cloth was made by a person, not a machine. They are what make it alive.</p><p>This philosophy — that imperfection is not a flaw but a feature, not an accident but an intention — is at the heart of everything Injiri makes. The name itself, an old Hindi word meaning "intimate," speaks to a different understanding of luxury: not the gleaming perfection of a mass-produced object, but the quiet warmth of something made with care, for someone specific.</p>`, cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80', category: 'Maker Portraits', author: 'House of Nomad Stories', published: true, published_at: '2026-03-15' },
}

export default function JournalPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<JournalPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('journal_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data }) => {
        setPost(data ? (data as JournalPost) : (MOCK[slug ?? ''] ?? null))
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div style={{ padding: '8rem 4rem', textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', color: 'var(--muted)', fontStyle: 'italic' }}>Loading…</div>
  if (!post) return (
    <div style={{ padding: '8rem 4rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'var(--muted)' }}>Story not found</h2>
      <Link to="/journal" style={{ color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>← Back to Journal</Link>
    </div>
  )

  return (
    <article style={{ paddingTop: 'var(--nav-h)', fontFamily: 'Jost, sans-serif', background: 'var(--white)' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: '55vh', overflow: 'hidden', background: 'var(--charcoal)' }}>
        {post.cover_image && <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,15,10,0.85) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '3rem', left: '4rem', maxWidth: '700px' }}>
          {post.category && <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--charcoal)', padding: '0.3rem 0.8rem', display: 'inline-block', marginBottom: '1rem' }}>{post.category}</span>}
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, color: 'white' }}>{post.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', fontSize: '0.72rem', fontWeight: 200, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          <span>{post.author}</span>
          {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
        </div>

        {post.excerpt && (
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', lineHeight: 1.65, color: 'var(--charcoal)', marginBottom: '2.5rem', borderLeft: '2px solid var(--gold)', paddingLeft: '1.5rem' }}>
            {post.excerpt}
          </p>
        )}

        {post.content ? (
          <div
            style={{ fontSize: '0.92rem', lineHeight: 2, color: 'var(--muted)', fontWeight: 300 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Full article coming soon.</p>
        )}

        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--sand)' }}>
          <Link to="/journal" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--charcoal)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: '0.2rem' }}>
            ← Back to Journal
          </Link>
        </div>
      </div>
    </article>
  )
}
