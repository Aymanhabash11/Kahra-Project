import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadDesigners, loadProducts, normalize } from '../lib/utils'
import type { Designer, Product } from '../lib/types'
import ProductCard from '../components/ProductCard'
import { SkeletonProductGrid } from '../components/Skeleton'
import '../styles/designer.css'

export default function Designers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [designers, setDesigners] = useState<Designer[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const activeDesigner = searchParams.get('designer') ?? ''

  useEffect(() => {
    Promise.all([loadDesigners(), loadProducts()]).then(([d, p]) => {
      setDesigners(d)
      setAllProducts(p)
      setLoading(false)
    })
  }, [])

  const selectedDesigner: Designer | undefined = activeDesigner
    ? designers.find(d => normalize(d.name) === normalize(activeDesigner))
    : undefined

  // Match products to designer by vendor name (works whether data is from Supabase or JSON)
  const products: Product[] = activeDesigner
    ? allProducts.filter(p => normalize(p.vendor ?? '') === normalize(activeDesigner))
    : []

  function setPill(value: string) {
    if (value) setSearchParams({ designer: value })
    else setSearchParams({})
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-label">02.2 The Makers</div>
          <h1>Craft without<br /><em>compromise</em></h1>
        </div>
        <div className="product-count">
          {loading ? '' : activeDesigner
            ? `${products.length} piece${products.length !== 1 ? 's' : ''} by ${activeDesigner}`
            : `${designers.length} designer${designers.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div className="filter-bar">
        <div className="filter-label">Designer</div>
        <div className="filter-pills">
          <button
            className={`pill${!activeDesigner ? ' active' : ''}`}
            onClick={() => setPill('')}
          >
            All
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

      {/* ── All designers overview ── */}
      {!activeDesigner && (
        <div className="designers-overview">
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="designer-ov-card designer-ov-card--skeleton">
                  <div className="designer-ov-img sk" />
                  <div className="designer-ov-body">
                    <span className="sk sk-line" style={{ width: '60%', height: 14 }} />
                    <span className="sk sk-line" style={{ width: '40%', height: 10, marginTop: 6 }} />
                    <span className="sk sk-line" style={{ width: '90%', height: 10, marginTop: 12 }} />
                    <span className="sk sk-line" style={{ width: '75%', height: 10 }} />
                    <span className="sk sk-line" style={{ width: '30%', height: 10, marginTop: 10 }} />
                  </div>
                </div>
              ))
            : designers.map(d => {
                const designerProducts = allProducts.filter(p => normalize(p.vendor ?? '') === normalize(d.name))
                const img = d.image_url || designerProducts[0]?.image_url
                const count = designerProducts.length
                return (
                  <div
                    key={d.id}
                    className="designer-ov-card"
                    onClick={() => setPill(d.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setPill(d.name)}
                  >
                    <div className="designer-ov-img">
                      {img
                        ? <img src={img} alt={d.name} loading="lazy" />
                        : <span className="designer-ov-placeholder">◇</span>}
                    </div>
                    <div className="designer-ov-body">
                      <div className="designer-ov-name">{d.name}</div>
                      {d.origin && <div className="designer-ov-origin">{d.origin}</div>}
                      {d.bio && <p className="designer-ov-bio">{d.bio}</p>}
                      <div className="designer-ov-count">
                        {count} piece{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>
      )}

      {/* ── Single designer: profile + products ── */}
      {activeDesigner && (
        <>
          {/* Designer profile hero */}
          {!loading && selectedDesigner && (
            <div className="designer-profile">
              <div className="designer-profile-img">
                {(() => {
                  const img = selectedDesigner.image_url || allProducts.find(p => normalize(p.vendor ?? '') === normalize(activeDesigner))?.image_url
                  return img
                    ? <img src={img} alt={selectedDesigner.name} />
                    : <div className="designer-profile-placeholder">◇</div>
                })()}
              </div>
              <div className="designer-profile-info">
                {selectedDesigner.origin && (
                  <div className="designer-profile-origin">{selectedDesigner.origin}</div>
                )}
                <h2 className="designer-profile-name">{selectedDesigner.name}</h2>
                {selectedDesigner.bio && (
                  <p className="designer-profile-bio">{selectedDesigner.bio}</p>
                )}
                <div className="designer-profile-meta">
                  {selectedDesigner.website && (
                    <a
                      href={selectedDesigner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="designer-profile-link"
                    >
                      Visit Studio →
                    </a>
                  )}
                  <span className="designer-profile-count">
                    {products.length} piece{products.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="designer-products-section">
            {!loading && selectedDesigner && (
              <div className="designer-products-divider">
                <span>Collection by {selectedDesigner.name}</span>
              </div>
            )}
            <div className="grid-wrapper">
              <div className="grid">
                {loading && <SkeletonProductGrid count={6} />}
                {!loading && products.length === 0 && (
                  <div className="empty-state"><p>No products found.</p></div>
                )}
                {!loading && products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
