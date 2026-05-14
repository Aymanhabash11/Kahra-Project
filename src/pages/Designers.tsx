import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadDesigners, normalize } from '../lib/utils'
import type { Designer, Product } from '../lib/types'
import ProductCard from '../components/ProductCard'
import '../styles/designer.css'

export default function Designers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)

  const activeDesigner = searchParams.get('designer') ?? ''

  useEffect(() => {
    loadDesigners().then(d => { setDesigners(d); setLoading(false) })
  }, [])

  // Get all products for display
  const allProducts: Product[] = designers.flatMap(d => d.products ?? [])

  const filtered: Product[] = activeDesigner
    ? allProducts.filter(p =>
        normalize(p.vendor ?? '') === normalize(activeDesigner)
      )
    : allProducts

  function setPill(value: string) {
    if (value) setSearchParams({ designer: value })
    else setSearchParams({})
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-label">02.2 The Makers</div>
          <h1>Craft without<br /><em>compromise</em></h1>
        </div>
        <div className="product-count">
          {loading ? '' : activeDesigner
            ? `${filtered.length} pieces by ${activeDesigner}`
            : `${designers.length} designers`}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-label">Filter by</div>
        <div className="filter-pills">
          <button className={`pill${!activeDesigner ? ' active' : ''}`} onClick={() => setPill('')}>
            All Designers
          </button>
          {designers.map(d => (
            <button
              key={d.id}
              className={`pill${normalize(activeDesigner) === normalize(d.name) ? ' active' : ''}`}
              onClick={() => setPill(d.name)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-wrapper">
        <div className="grid">
          {loading && (
            <div className="empty-state"><p>Loading…</p></div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="empty-state"><p>No products found.</p></div>
          )}
          {!loading && filtered.map(p => (
            <ProductCard key={p.id} product={p} showDesignerTag />
          ))}
        </div>
      </div>
    </>
  )
}
