const ITEMS = [
  '7 Retail Concepts', 'KAFD · Shura Island · AMAALA', 'Saudi Craftsmanship',
  'International Design', 'Vision 2030 Enabled', 'Sustainability First',
  'Norah AlTamimi · Karin Kämpf', 'Luxury Without Compromise',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i}>
            {item}
            {i < doubled.length - 1 && <span className="dot">◆</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
