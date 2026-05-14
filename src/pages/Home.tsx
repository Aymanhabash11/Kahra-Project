import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Marquee from '../components/Marquee'
import { loadProducts, loadDesigners, DESIGNER_ORIGINS } from '../lib/utils'
import type { Product, Designer } from '../lib/types'
import { supabase } from '../lib/supabase'
import '../styles/globals.css'

declare const gsap: { timeline: (opts: object) => GSAPTimeline; to: (...a: unknown[]) => unknown; from: (...a: unknown[]) => unknown }
interface GSAPTimeline { to: (...a: unknown[]) => GSAPTimeline; from: (...a: unknown[]) => GSAPTimeline }

const FEATURED_CATEGORIES = ['kimonos', 'dresses', 'knitwear', 'accessories', 'shoes']
const FEATURED_DESIGNERS = ['Injiri', 'Gudrun & Gudrun', 'Marrakshi Life', 'Ka-Sha']

const ArchMark = () => (
  <svg width="54" height="20" viewBox="0 0 54 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 20 Q8 1 15 20" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M20 20 Q27 1 34 20" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M39 20 Q46 1 53 20" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
)

export default function Home() {
  const navigate = useNavigate()
  const [collectionCards, setCollectionCards] = useState<Product[]>([])
  const [featuredDesigners, setFeaturedDesigners] = useState<Designer[]>([])
  const [newsletter, setNewsletter] = useState({ name: '', email: '' })
  const [nlSent, setNlSent] = useState(false)

  useEffect(() => {
    loadProducts().then(products => {
      const picks: Product[] = []
      FEATURED_CATEGORIES.forEach(cat => {
        const pool = products.filter(p => p.collection === cat)
        if (pool.length) picks.push(pool[Math.floor(Math.random() * pool.length)])
      })
      setCollectionCards(picks)
    })

    loadDesigners().then(designers => {
      const picks = FEATURED_DESIGNERS
        .map(name => designers.find(d => d.name === name))
        .filter(Boolean) as Designer[]
      setFeaturedDesigners(picks)
    })

    // GSAP hero animation
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-bg',    { duration: 1.2, scale: 1.05, ease: 'power2.out' })
        .from('.hero-eyebrow', { duration: 0.5, y: 16 }, '-=0.8')
        .from('.hero-title',   { duration: 0.6, y: 20 }, '-=0.4')
        .from('.hero-sub',     { duration: 0.5, y: 16 }, '-=0.3')
        .from('.hero-cta',     { duration: 0.4, y: 10 }, '-=0.3')
    }

    const onMouseMove = (e: MouseEvent) => {
      if (typeof gsap === 'undefined') return
      const x = (e.clientX / window.innerWidth  - 0.5) * 18
      const y = (e.clientY / window.innerHeight - 0.5) * 18
      gsap.to('.hero-bg', { duration: 0.8, x, y, ease: 'power2.out' })
    }
    document.addEventListener('mousemove', onMouseMove)

    // Reveal observer
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      obs.disconnect()
    }
  }, [])

  // re-observe after dynamic content
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [collectionCards, featuredDesigners])

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (!newsletter.email) return
    await supabase.from('newsletter_subscribers').upsert({ email: newsletter.email, name: newsletter.name }, { onConflict: 'email' })
    setNlSent(true)
  }

  return (
    <>
      {/* ── HERO ── */}
      <section id="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-eyebrow">A Subsidiary of AWN Enterprises · Est. 2024</div>
          <h1 className="hero-title">
            KAHRA
            <em>Studio Group</em>
          </h1>
          <p className="hero-sub">
            A luxury retail concept company blending international design with Saudi craftsmanship
          </p>
          <div className="hero-cta">
            <Link to="/collection" className="btn btn-primary">Explore Concepts</Link>
            <Link to="/designers" className="btn btn-outline">Our Makers</Link>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      <Marquee />

      {/* ── 01.1 ABOUT ── */}
      <section className="kahra-about">
        <div className="kahra-about-inner">
          <div>
            <span className="kahra-about-label reveal">01.1 About KAHRA Studio Group</span>
            <h2 className="kahra-about-title reveal reveal-delay-1">
              Born from a<br />trans-cultural<br />partnership
            </h2>
            <p className="kahra-about-body reveal reveal-delay-2">
              KAHRA Studio Group is a luxury retail concept company founded by Norah AlTamimi
              and Karin Kämpf, a subsidiary of AWN Enterprises. Born from a trans-cultural
              partnership, KAHRA represents the intersection of fashion, art, and cultural
              heritage — creating thoughtfully designed retail environments where curated
              collections reflect a dedication to quality, sustainability, and artistic expression.
            </p>
            <p className="kahra-about-body reveal reveal-delay-2">
              Spanning three destinations across Saudi Arabia — KAFD Riyadh, Shura Island, and
              AMAALA — KAHRA introduces seven distinct retail concepts, each a carefully authored
              world unto itself.
            </p>
            <div className="kahra-about-founders reveal reveal-delay-3">
              Norah T. AlTamimi · Karin Kämpf — Co-Founders
            </div>
          </div>
          <div className="kahra-about-image reveal reveal-delay-1">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
              alt="KAHRA Studio Group interior"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── 01.2 CORE VALUES ── */}
      <section className="kahra-values">
        <div className="kahra-values-header">
          <div>
            <div className="section-label reveal">01.2 Core Values</div>
            <h2 className="kahra-values-title reveal reveal-delay-1">
              The principles<br />that guide us
            </h2>
          </div>
        </div>
        <div className="kahra-values-grid">
          {[
            {
              num: '01',
              name: 'Sustainability',
              desc: 'Every decision is grounded in environmental responsibility — from material sourcing to energy efficiency, aligned with Red Sea Global\'s 30% net conservation benefit goal by 2040.',
            },
            {
              num: '02',
              name: 'Cultural Fusion',
              desc: 'We honour the richness of Saudi heritage while embracing international perspectives — creating spaces where East and West meet with mutual respect and curiosity.',
            },
            {
              num: '03',
              name: 'Timeless Creativity',
              desc: 'We champion makers and designers whose work transcends trends — rooted in craft, elevated by vision, enduring across generations.',
            },
            {
              num: '04',
              name: 'Future-Driven Responsibility',
              desc: 'Enabled by Vision 2030, we position Saudi Arabia on the global luxury map while investing in the next generation of Saudi creative talent.',
            },
          ].map((v, i) => (
            <div key={v.num} className={`kahra-value-card reveal${i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}>
              <span className="kahra-value-num">{v.num}</span>
              <div className="kahra-value-name">{v.name}</div>
              <p className="kahra-value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section-collection" id="collection">
        <div className="collection-header">
          <div>
            <div className="section-label reveal">02.1 Featured Selections</div>
            <h2 className="collection-title reveal reveal-delay-1">From the Concepts</h2>
          </div>
          <div className="collection-nav">
            <Link to="/collection" className="col-btn" aria-label="View all">→</Link>
          </div>
        </div>
        <div className="collection-grid">
          {collectionCards.map((p, i) => (
            <div
              key={p.id}
              className={`collection-card reveal${i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}
              onClick={() => navigate(`/product/${p.handle}`)}
            >
              <img src={p.image_url} alt={p.title} loading="lazy" />
              <div className="card-hover-overlay" />
              <div className="card-info">
                <div className="card-tag">{p.collection}</div>
                <div className="card-name">{p.title.split(' - ')[0]}</div>
                <div className="card-price">${Number(p.price).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOCATIONS ── */}
      <section className="kahra-locations">
        <div className="kahra-locations-header">
          <span className="kahra-locations-eyebrow reveal">01.5 Three Destinations</span>
          <p className="kahra-locations-vision reveal reveal-delay-1">
            Enabled by Vision 2030 — both projects position Saudi Arabia on the global tourism map,
            attracting discerning travellers from over 100 countries.
          </p>
        </div>
        <div className="kahra-locations-grid">
          {[
            {
              num: '01 · Riyadh',
              name: 'KAFD Riyadh',
              sub: '1 Concept Space',
              img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
              desc: '$11.6B development, 1.6M sqm, LEED-certified mixed-use financial district. Strategically positioned as Riyadh\'s premier lifestyle destination, KAFD sets the stage for KAHRA\'s flagship urban presence.',
            },
            {
              num: '02 · Red Sea',
              name: 'Shura Island',
              sub: '7 Concept Spaces · Coral Bloom',
              img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
              desc: 'Part of The Red Sea Project, designed by Foster + Partners. A hub island of 11 luxury hotels — Rosewood, Raffles, Jumeirah, Fairmont, Grand Hyatt, Four Seasons, Faena, Edition, SLS, InterContinental, and Miraval.',
            },
            {
              num: '03 · AMAALA',
              name: 'Triple Bay',
              sub: '7 Concept Spaces · Wellness Luxury',
              img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
              desc: 'Wellness-focused luxury destination. Hotels include Ritz-Carlton, Six Senses, Rosewood, Equinox, Four Seasons, Clinique La Prairie, and Jayasom — each a destination for holistic living and conscious indulgence.',
            },
          ].map((loc, i) => (
            <div key={loc.num} className={`kahra-location-card reveal${i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}>
              <span className="kahra-location-num">{loc.num}</span>
              <img src={loc.img} alt={loc.name} className="kahra-location-img" loading="lazy" />
              <div className="kahra-location-name">{loc.name}</div>
              <span className="kahra-location-sub">{loc.sub}</span>
              <p className="kahra-location-desc">{loc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 01.6 TARGET AUDIENCE ── */}
      <section className="kahra-audience">
        <div className="kahra-audience-inner">
          <div>
            <span className="kahra-audience-label reveal">01.6 Target Audience</span>
            <p className="kahra-audience-lead reveal reveal-delay-1">
              A curated audience of affluent Saudi women, expatriate professionals,
              Gen Z tastemakers, and international ultra-luxury travellers.
            </p>
          </div>
          <div className="kahra-audience-stats reveal reveal-delay-1">
            {[
              {
                num: '12,500+',
                label: 'KAFD Riyadh Residents',
                detail: 'growing to 50,000 · 5,000+ apartment units · 900,000+ sqm office space',
              },
              {
                num: '~1M',
                label: 'Shura Island Annual Cap',
                detail: 'capped for ultra-luxury exclusivity · 11 landmark hotels',
              },
              {
                num: '3,000',
                label: 'AMAALA Rooms (Phase 1)',
                detail: 'expanding to 25 hotels · 200 retail spaces · wellness destination',
              },
            ].map(s => (
              <div key={s.label} className="kahra-audience-stat">
                <span className="kahra-audience-num">{s.num}</span>
                <span className="kahra-audience-stat-label">{s.label}</span>
                <span className="kahra-audience-detail">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02.3 THE SEVEN CONCEPTS ── */}
      <section className="kahra-concepts">
        <div className="kahra-concepts-header">
          <div>
            <div className="section-label reveal">02.3 The Seven Concepts</div>
            <h2 className="kahra-concepts-title reveal reveal-delay-1">
              Seven worlds,<br />one vision
            </h2>
          </div>
          <div className="kahra-arch-mark reveal reveal-delay-2"><ArchMark /></div>
        </div>

        <div className="kahra-concepts-grid">

          {/* 01 — HONS hero card, full-width */}
          <div className="kahra-concept-card hero-card reveal">
            <div className="kahra-concept-hero-left">
              <span className="kahra-concept-num">01</span>
              <div className="kahra-concept-name">House of<br />Nomad Stories</div>
              <div className="kahra-concept-type">Women & Kids Multibrand · Fashion, Art & Home</div>
              <p className="kahra-concept-tagline">
                "More than a new retail concept — it's a living habitat."
              </p>
              <p className="kahra-concept-desc">
                A luxury sanctuary deeply rooted in nature, where brands, materials, and design
                seamlessly merge with the environment. A haven for conscious shoppers, where culture,
                craftsmanship, and meaningful exchanges converge — tracing a delicate balance between
                modernity and tradition. In the spirit of a boutique as a home — the soul of the brand.
              </p>
            </div>
            <div className="kahra-concept-hero-right">
              <div className="kahra-concept-values">
                Uniqueness · Empowerment · Sustainability
              </div>
              <div className="kahra-concept-assortment">
                Women's Fashion · Kids Fashion · Fashion Accessories & Bags · Shoes · Jewelry
                · Art · Home, Books & Magazines · Scents & Beauty
              </div>
              <div className="kahra-concept-brands">
                Gabriela Hearst · Chloé · Nanushka · Litkovska · Noon by Noor · Mona Alshebil
                · Abadia · Sole Studio · Maison Artc · My Sleeping Gypsy · Tessa Sakhi · Alemais
                · Clandestine Ceramic · Kimabaya · Le Monde Beryl · Assouline
              </div>
              <div className="kahra-concept-services" style={{ marginTop: 'auto' }}>
                Personal Shopping & Private Styling · Atelier Tailoring
                · Personalized Monogram · Home Delivery
              </div>
            </div>
          </div>

          {/* 02 — Azura */}
          <div className="kahra-concept-card reveal">
            <span className="kahra-concept-num">02</span>
            <div className="kahra-concept-name">Azura</div>
            <div className="kahra-concept-type">Resort & Swimwear</div>
            <p className="kahra-concept-tagline">
              Fluid forms born of coastline and sun — curated resortwear for the considered traveller.
            </p>
            <div className="kahra-concept-brands" style={{ marginTop: 'auto' }}>Eres · Vilebrequin · Haight · Anjuna</div>
          </div>

          {/* 03 — Archipelago */}
          <div className="kahra-concept-card reveal reveal-delay-1">
            <span className="kahra-concept-num">03</span>
            <div className="kahra-concept-name">Archipelago</div>
            <div className="kahra-concept-type">Scents & Fragrances</div>
            <p className="kahra-concept-tagline">
              A sensory atlas — rare perfumes mapping the world's most evocative landscapes.
            </p>
            <div className="kahra-concept-brands" style={{ marginTop: 'auto' }}>Byredo · Nasomatto · Memo Paris · Orto Parisi</div>
          </div>

          {/* 04 — Ultraviolet */}
          <div className="kahra-concept-card reveal reveal-delay-2">
            <span className="kahra-concept-num">04</span>
            <div className="kahra-concept-name">Ultraviolet</div>
            <div className="kahra-concept-type">Sunglass Store</div>
            <p className="kahra-concept-tagline">Vision refined. Each frame a sculpture, each lens a worldview.</p>
            <div className="kahra-concept-brands" style={{ marginTop: 'auto' }}>Linda Farrow · Lapima · Kuboraum · Jacques Marie Mage · Phoebe Philo</div>
          </div>

          {/* 05 — The Foundry */}
          <div className="kahra-concept-card reveal">
            <span className="kahra-concept-num">05</span>
            <div className="kahra-concept-name">The Foundry</div>
            <div className="kahra-concept-type">Saudi Creative Art & Lifestyle</div>
            <p className="kahra-concept-tagline">
              A platform for Saudi creativity — where artisanal heritage meets contemporary expression.
            </p>
            <div className="kahra-concept-brands" style={{ marginTop: 'auto' }}>Emerging Saudi Makers · Local Craft Collectives</div>
          </div>

          {/* 06 — HONS Home (wide) */}
          <div className="kahra-concept-card featured reveal reveal-delay-1">
            <span className="kahra-concept-num">06</span>
            <div className="kahra-concept-name">HONS Home</div>
            <div className="kahra-concept-type">Home & Art Concept Store</div>
            <p className="kahra-concept-tagline">
              Earth & Grounding — there's no place like home. A rooted celebration of tradition and modernity,
              a grounded tactile space that champions slow living and mindful interiors.
            </p>
            <div className="kahra-concept-brands" style={{ marginTop: 'auto' }}>
              LRNCE · JP Meyer · Ikkimo · Assouline · Clandestine Ceramic · Mirror in the Sky · Oberflatch · Kilometre Paris
            </div>
          </div>

          {/* 07 — Marjani */}
          <div className="kahra-concept-card reveal">
            <span className="kahra-concept-num">07</span>
            <div className="kahra-concept-name">Marjani</div>
            <div className="kahra-concept-type">Chocolate & Sweet</div>
            <p className="kahra-concept-tagline">
              The art of slowness made edible — rare cacao, regional confections, considered indulgence.
            </p>
            <div className="kahra-concept-brands" style={{ marginTop: 'auto' }}>Valrhona · Compartés · Mast Brothers</div>
          </div>

        </div>
      </section>

      {/* ── CLOSING QUOTE ── */}
      <section className="section-interlude">
        <div className="interlude-bg" />
        <div className="interlude-text reveal">
          <p className="interlude-quote">
            "The best collaborations create something bigger than the sum
            of what each person can create on their own."
          </p>
          <p className="interlude-attr">— Rei Kawakubo</p>
        </div>
      </section>

      {/* ── FEATURED MAKERS ── */}
      <section className="section-designers" id="designers">
        <div className="designers-intro">
          <div>
            <div className="section-label reveal">02.2 Featured Makers</div>
            <h2 className="designers-title reveal reveal-delay-1">
              Craft without<br />compromise
            </h2>
          </div>
          <p className="designers-desc reveal reveal-delay-2">
            We seek out quiet visionaries — artisans and designers whose work embodies
            cultural depth and timeless quality. From the looms of Jaipur to the ateliers
            of Paris, each maker carries a story worth living with.
          </p>
        </div>
        <div className="designer-list">
          {featuredDesigners.map((d, i) => {
            const image = d.image_url ?? d.products?.[0]?.image_url ?? ''
            const origin = DESIGNER_ORIGINS[d.name] ?? d.origin ?? ''
            return (
              <div
                key={d.id}
                className={`designer-item reveal${i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}
                onClick={() => navigate(`/designers?designer=${encodeURIComponent(d.name)}`)}
              >
                {image && <img src={image} alt={d.name} loading="lazy" />}
                <div className="designer-label">
                  <div className="designer-name">{d.name}</div>
                  {origin && <div className="designer-origin">{origin}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-bar">
        {[
          { num: '7',    label: 'Retail Concepts' },
          { num: '3',    label: 'Destinations' },
          { num: '15+',  label: 'Luxury Hotel Partners' },
          { num: '2030', label: 'Vision Enabled' },
        ].map((s, i) => (
          <div key={s.label} className={`stat-item reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FOUNDERS ── */}
      <section className="kahra-founders">
        <div className="kahra-founder-row">
          <div className="kahra-founder-text">
            <span className="kahra-founder-label reveal">01.3 Co-Founder</span>
            <div className="kahra-founder-name reveal reveal-delay-1">Norah T.<br />AlTamimi</div>
            <div className="kahra-founder-role reveal reveal-delay-1">Co-Founder · AWN Enterprises</div>
            <p className="kahra-founder-bio reveal reveal-delay-2">
              A visionary entrepreneur rooted in Saudi Arabia's cultural renaissance,
              Norah AlTamimi brings deep knowledge of the Kingdom's evolving luxury landscape.
              Her ventures span retail, hospitality, and experience design — each reflecting
              a commitment to Saudi heritage and global aspiration.
            </p>
            <div className="kahra-founder-ventures reveal reveal-delay-2">
              AWN · Pattis · Baheej · Bloom
            </div>
          </div>
          <div className="kahra-founder-img-wrap reveal reveal-delay-1">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
              alt="Norah T. AlTamimi"
              loading="lazy"
            />
          </div>
        </div>
        <div className="kahra-founder-row reverse">
          <div className="kahra-founder-text">
            <span className="kahra-founder-label reveal">01.4 Co-Founder</span>
            <div className="kahra-founder-name reveal reveal-delay-1">Karin<br />Kämpf</div>
            <div className="kahra-founder-role reveal reveal-delay-1">Co-Founder · Creative Director</div>
            <p className="kahra-founder-bio reveal reveal-delay-2">
              With over 40 years in international fashion, Karin Kämpf has shaped some of
              the world's most iconic luxury brands. Her tenure at Fendi and MaxMara defined
              an era of European elegance, while her sustainable line Adushka reflects a
              lifelong commitment to conscious creation.
            </p>
            <div className="kahra-founder-ventures reveal reveal-delay-2">
              Fendi · MaxMara · Adushka
            </div>
          </div>
          <div className="kahra-founder-img-wrap reveal reveal-delay-1">
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80"
              alt="Karin Kämpf"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── PARTNERSHIP ── */}
      <section className="kahra-partnership">
        <div className="kahra-partnership-inner">
          <div>
            <span className="kahra-partnership-label reveal">Design Partner</span>
            <div className="kahra-partnership-name reveal reveal-delay-1">
              Saint-Lazare
            </div>
          </div>
          <div className="reveal reveal-delay-1">
            <p className="kahra-partnership-body">
              KAHRA's retail environments are conceived in collaboration with Saint-Lazare —
              a Paris and New York design studio, part of Grand Bureau, renowned for
              translating brand identity into spatial narratives of exceptional refinement.
              Together, we craft environments that make the invisible tangible.
            </p>
            <div className="kahra-partnership-founders-mono reveal reveal-delay-2">
              Clémentine Larroumet · Antoine Ricardou · Corentin Petit (ex-Sézane founder)
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="section-newsletter">
        <div>
          <div className="section-label reveal">Stay Connected</div>
          <h2 className="newsletter-title reveal reveal-delay-1">
            Receive our<br /><em>editorial letters</em>
          </h2>
          <p className="newsletter-text reveal reveal-delay-2">
            New openings, maker stories, concept launches, and invitations from our
            team across Riyadh, Shura Island, and AMAALA — delivered with intention.
          </p>
        </div>
        <div className="reveal reveal-delay-2">
          {nlSent ? (
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--terracotta)', fontSize: '1.1rem' }}>
              Thank you — we'll be in touch.
            </p>
          ) : (
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input className="newsletter-input" type="text" placeholder="Your name"
                value={newsletter.name} onChange={e => setNewsletter(s => ({ ...s, name: e.target.value }))} />
              <input className="newsletter-input" type="email" placeholder="Your email address" required
                value={newsletter.email} onChange={e => setNewsletter(s => ({ ...s, email: e.target.value }))} />
              <button type="submit" className="newsletter-submit">Subscribe →</button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
