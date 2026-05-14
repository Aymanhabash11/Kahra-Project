import { useEffect } from 'react'
import RevealWrapper from '../components/RevealWrapper'
import '../styles/story.css'

const PILLARS = [
  { num: '01', title: 'Sustainability', body: 'Every material choice, energy decision, and partnership reflects our commitment to responsible luxury — aligned with Red Sea Global\'s 30% net conservation benefit goal by 2040.' },
  { num: '02', title: 'Cultural Fusion', body: 'KAHRA was born from a trans-cultural dialogue. We honour Saudi heritage while embracing international vision — creating spaces where East and West meet with genuine curiosity.' },
  { num: '03', title: 'Timeless Creativity', body: 'We champion makers whose work transcends trend cycles — rooted in craft, elevated by vision, built to endure across decades and generations.' },
  { num: '04', title: 'Future-Driven Responsibility', body: 'Enabled by Vision 2030, KAHRA positions Saudi Arabia as a global force in luxury retail — while actively investing in the next generation of Saudi creative talent.' },
  { num: '05', title: 'Intentional Curation', body: 'Each concept, each brand, each object is selected for its story. We refuse the arbitrary. Everything we carry earns its place through quality, authenticity, and meaning.' },
  { num: '06', title: 'Human Connection', body: 'Behind every collection is a human story. We build deep relationships with our makers and believe retail, at its finest, is the art of meaningful exchange.' },
]

export default function OurStory() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* ── HERO ── */}
      <section className="story-hero">
        <div className="story-hero-bg" />
        <div className="story-hero-overlay" />
        <div className="story-hero-content">
          <span className="section-label">About KAHRA Studio Group</span>
          <h1 className="story-hero-title">
            Where luxury<br /><em>meets purpose</em>
          </h1>
          <p className="story-hero-lead">
            A luxury retail concept company founded by Norah AlTamimi and Karin Kämpf —
            born from a trans-cultural partnership, and a shared belief that great retail
            is an act of cultural storytelling.
          </p>
        </div>
      </section>

      {/* ── FOUNDING ── */}
      <section className="section-founding">
        <div className="founding-image kahra-arch-top">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
            alt="KAHRA Studio Group"
          />
          <span className="founding-image-caption">KAHRA Studio Group · AWN Enterprises</span>
        </div>
        <div className="founding-text">
          <RevealWrapper>
            <h2>A subsidiary of AWN —<br /><em>a story of two visions</em></h2>
          </RevealWrapper>
          <RevealWrapper className="reveal-delay-1">
            <p>
              Norah AlTamimi and Karin Kämpf met through a shared conviction: that luxury retail,
              done with integrity, can be one of the most powerful vehicles for cultural exchange.
              Together, they founded KAHRA Studio Group as a subsidiary of AWN Enterprises —
              bringing Norah's deep roots in Saudi Arabia's creative renaissance together with
              Karin's 40+ years at the forefront of international fashion.
            </p>
            <p>
              The name KAHRA holds both founders within it — and reflects the company's dual
              identity: internationally fluent, deeply locally rooted. Not a brand imposed on a
              place, but one grown from it.
            </p>
            <p>
              Across three landmark destinations — KAFD Riyadh, Shura Island, and AMAALA —
              KAHRA introduces seven distinct retail concepts, each a carefully authored world,
              each contributing to Saudi Arabia's place on the global luxury map.
            </p>
          </RevealWrapper>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <div className="quote-band">
        <RevealWrapper>
          <blockquote>
            "The best collaborations create something bigger than the sum
            of what each person can create on their own."
          </blockquote>
          <cite>— Rei Kawakubo</cite>
        </RevealWrapper>
      </div>

      {/* ── PILLARS ── */}
      <section className="section-values">
        <div className="values-header">
          <RevealWrapper>
            <span className="section-label">Our Pillars</span>
            <h2>What we <em>stand for</em></h2>
          </RevealWrapper>
        </div>
        <div className="values-grid">
          {PILLARS.map((v, i) => (
            <div key={v.num} className={`value-item reveal${i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}>
              <div className="value-num">{v.num}</div>
              <div className="value-title">{v.title}</div>
              <p className="value-body">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOUNDERS ── */}
      <section className="section-founders">
        <div className="founders-header">
          <RevealWrapper>
            <span className="section-label">01.3 — 01.4 The Founders</span>
            <h2>Two <em>visionaries</em></h2>
          </RevealWrapper>
        </div>
        <div className="founders-grid">
          {[
            {
              name: 'Norah T. AlTamimi',
              role: 'Co-Founder · AWN Enterprises',
              bio: 'A visionary entrepreneur at the heart of Saudi Arabia\'s cultural renaissance. Norah\'s ventures — AWN, Pattis, Baheej, Bloom — span retail, hospitality, and experience design, each reflecting her commitment to Saudi heritage and global aspiration. Her deep knowledge of the Kingdom\'s evolving luxury landscape is the compass that guides KAHRA\'s local vision.',
            },
            {
              name: 'Karin Kämpf',
              role: 'Co-Founder · Creative Director',
              bio: 'With over 40 years shaping international luxury fashion, Karin\'s career spans Fendi and MaxMara — institutions that defined European elegance for generations. Her sustainable label Adushka reflects a lifelong commitment to conscious creation. At KAHRA, she brings an uncompromising curatorial eye and a trans-cultural fluency that bridges Geneva, Paris, and Riyadh.',
            },
          ].map(f => (
            <div key={f.name} className="founder-card">
              <div className="founder-photo">
                <div className="founder-photo-placeholder">◇</div>
              </div>
              <div className="founder-info">
                <div className="founder-name">{f.name}</div>
                <div className="founder-role">{f.role}</div>
                <p className="founder-bio">{f.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="section-visit">
        <div className="visit-text">
          <RevealWrapper>
            <span className="section-label">Three Destinations</span>
            <h2>Find us across<br /><em>Saudi Arabia</em></h2>
          </RevealWrapper>
          <RevealWrapper className="reveal-delay-1">
            <p>KAHRA operates across three of Saudi Arabia's most ambitious luxury developments, each shaping a new chapter in the Kingdom's global story.</p>
            <div className="visit-detail">
              <span className="visit-detail-icon">◆</span>
              <div className="visit-detail-text">
                <strong>KAFD Riyadh</strong>
                King Abdullah Financial District · 1 Concept Space · LEED-certified mixed-use district
              </div>
            </div>
            <div className="visit-detail">
              <span className="visit-detail-icon">◆</span>
              <div className="visit-detail-text">
                <strong>Shura Island · Red Sea</strong>
                Coral Bloom · 7 Concept Spaces · Foster + Partners · 11 Luxury Hotels
              </div>
            </div>
            <div className="visit-detail">
              <span className="visit-detail-icon">◆</span>
              <div className="visit-detail-text">
                <strong>AMAALA Triple Bay</strong>
                7 Concept Spaces · Wellness Luxury · Ritz-Carlton, Six Senses, Rosewood & more
              </div>
            </div>
            <a href="mailto:hello@kahrastudiogroup.com" className="btn-visit">
              Get in Touch →
            </a>
          </RevealWrapper>
        </div>
        <div className="visit-image">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80"
            alt="KAHRA Destinations"
          />
        </div>
      </section>
    </>
  )
}
