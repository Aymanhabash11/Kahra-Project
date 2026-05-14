import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { loadProducts } from '../lib/utils'
import type { Product as ProductType } from '../lib/types'
import { useCart } from '../context/CartContext'
import { SkeletonProductPage } from '../components/Skeleton'
import '../styles/product.css'

export default function Product() {
  const { handle } = useParams<{ handle: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState<ProductType | null>(null)
  const [related, setRelated] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)

  const [imgIndex, setImgIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')

  // Returns quantity for the given size+color from the variants array,
  // falling back to size_quantities then product.quantity
  function getVariantQty(size: string, color: string, p: ProductType): number {
    if (p.variants?.length) {
      const v = p.variants.find(v => v.size === size && v.color === color)
      if (v !== undefined) return v.quantity
    }
    // size-only fallback
    if (size && p.size_quantities?.[size] !== undefined) return p.size_quantities[size]
    return p.quantity ?? 0
  }

  // Available qty for the current selection (null = incomplete selection)
  function availableQty(p: ProductType): number | null {
    const hasVariants = (p.variants?.length ?? 0) > 0
    const hasSizes = (p.sizes?.length ?? 0) > 0
    const hasColors = (p.colors?.length ?? 0) > 0

    if (hasVariants) {
      const needsSize = hasSizes && !selectedSize
      const needsColor = hasColors && !selectedColor
      if (needsSize || needsColor) return null // prompt user
      return getVariantQty(selectedSize, selectedColor, p)
    }
    // Legacy: size_quantities only
    if (hasSizes && !selectedSize) return null
    if (selectedSize && p.size_quantities?.[selectedSize] !== undefined) return p.size_quantities[selectedSize]
    return p.quantity ?? 0
  }

  useEffect(() => {
    setQty(1)
    setSelectedSize('')
    setSelectedColor('')
    setImgIndex(0)
    setAdded(false)
    setLoading(true)
    loadProducts().then(products => {
      const found = products.find(p => p.handle === handle)
      setProduct(found ?? null)
      if (found) {
        const pool = products.filter(p => p.collection === found.collection && p.id !== found.id)
        setRelated(pool.slice(0, 4))
      }
      setLoading(false)
    })
  }, [handle])

  if (loading) return <SkeletonProductPage />
  if (!product) return (
    <div className="not-found">
      <h2>Product not found</h2>
      <Link to="/collection" style={{ color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid var(--gold)' }}>
        Back to Collection
      </Link>
    </div>
  )

  const images = product.all_images?.length ? product.all_images : [product.image_url]

  // If the selected colour has its own photo, show it as the main image
  const colorImage: string | null = (selectedColor && product.color_images?.[selectedColor]) || null

  async function handleAddToCart() {
    await addItem({
      product_id: product!.handle,
      product_title: product!.title,
      product_image: product!.image_url,
      product_price: product!.price,
      product_vendor: product!.vendor,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const ACCORDIONS = [
    { id: 'description', label: 'Description', content: product.description ?? 'Handcrafted with care by independent artisans. Each piece tells a unique story of cultural heritage and skilled craftsmanship.' },
    { id: 'materials', label: 'Materials & Care', content: product.materials ?? 'Natural fibres. Hand wash or dry clean as appropriate for the material.' },
    { id: 'shipping', label: 'Shipping & Returns', content: 'Worldwide shipping from Switzerland. Express 2–4 days, Standard 5–10 days. Returns accepted within 14 days.' },
    { id: 'maker', label: 'The Maker', content: product.vendor ? `This piece is by ${product.vendor}, an independent designer whose work reflects a deep connection to their cultural heritage and traditional craft practices.` : 'Made by an independent artisan designer.' },
  ]

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <Link to="/collection">Collection</Link>
        {product.collection && (
          <>
            <span className="sep">›</span>
            <Link to={`/collection?category=${product.collection}`}>{product.collection}</Link>
          </>
        )}
        <span className="sep">›</span>
        <span className="current">{product.title.split(' - ')[0]}</span>
      </div>

      <div className="product-layout">
        {/* GALLERY */}
        <div className="product-gallery">
          <div
            className={`gallery-main${zoomed ? ' zoomed' : ''}`}
            onClick={() => setZoomed(z => !z)}
            onMouseMove={e => {
              if (!zoomed) return
              const r = e.currentTarget.getBoundingClientRect()
              const ox = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'
              const oy = ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'
              ;(e.currentTarget as HTMLElement).style.setProperty('--ox', ox)
              ;(e.currentTarget as HTMLElement).style.setProperty('--oy', oy)
            }}
          >
            <img src={colorImage ?? images[imgIndex]} alt={product.title} />
            {images.length > 1 && !zoomed && (
              <>
                <button className="gallery-nav-btn prev" onClick={e => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length) }}>←</button>
                <button className="gallery-nav-btn next" onClick={e => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length) }}>→</button>
                <div className="gallery-counter">{imgIndex + 1} / {images.length}</div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <div key={i} className={`thumb${i === imgIndex ? ' active' : ''}`} onClick={() => setImgIndex(i)}>
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="product-info">
          <div className="product-meta-top">
            {product.vendor && (
              <Link to={`/designers?designer=${encodeURIComponent(product.vendor)}`} className="product-designer-link">
                {product.vendor}
              </Link>
            )}
            {product.collection && (
              <span className="product-category-tag">{product.collection}</span>
            )}
          </div>

          <h1 className="product-title">{product.title}</h1>

          <div className="product-price">
            ${Number(product.price).toFixed(2)}
            <span>incl. VAT</span>
          </div>

          <div className="divider" />

          {product.sizes?.length > 0 && (
            <>
              <div className="option-label">Size</div>
              <div className="size-grid">
                {product.sizes.map((s: string) => {
                  // A size is available if any variant for it has qty > 0
                  const anyAvailable = product.variants?.length
                    ? product.variants.some(v => v.size === s && v.quantity > 0)
                    : (product.size_quantities?.[s] ?? product.quantity ?? 0) > 0
                  return (
                    <button
                      key={s}
                      className={`size-btn${selectedSize === s ? ' selected' : ''}${!anyAvailable ? ' sold-out' : ''}`}
                      onClick={() => { if (anyAvailable) { setSelectedSize(s === selectedSize ? '' : s); setSelectedColor('') } }}
                      disabled={!anyAvailable}
                      title={!anyAvailable ? 'Sold out' : ''}
                    >
                      {s}
                      {!anyAvailable && <span className="size-sold-out-line" />}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {product.colors?.length > 0 && (
            <>
              <div className="option-label">
                Colour
                {selectedColor && <span className="selected-color-name">{selectedColor}</span>}
              </div>
              <div className="color-grid">
                {product.colors.map((c: string) => {
                  // If a size is selected, only show colors available for that size
                  const colorQty = selectedSize
                    ? getVariantQty(selectedSize, c, product)
                    : (product.variants?.length
                        ? product.variants.filter(v => v.color === c).reduce((sum, v) => sum + v.quantity, 0)
                        : product.quantity ?? 0)
                  const colorSoldOut = colorQty === 0
                  return (
                    <button
                      key={c}
                      className={`color-box${selectedColor === c ? ' selected' : ''}${colorSoldOut ? ' sold-out' : ''}`}
                      onClick={() => { if (!colorSoldOut) { setSelectedColor(c === selectedColor ? '' : c); setImgIndex(0) } }}
                      disabled={colorSoldOut}
                      title={colorSoldOut ? 'Sold out' : c}
                    >
                      <span className="color-box-dot" style={{ background: c.startsWith('#') ? c : undefined }} />
                      <span className="color-box-label">{c}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {(() => {
            const aqty = availableQty(product)
            const isSoldOut = aqty === 0
            const isLow = aqty !== null && aqty > 0 && aqty < 10
            const needsSize = (product.sizes?.length ?? 0) > 0 && !selectedSize
            const needsColor = (product.colors?.length ?? 0) > 0 && !selectedColor && (product.variants?.length ?? 0) > 0

            return (
              <>
                {aqty !== null && (
                  <div className="stock-status-row">
                    {isSoldOut
                      ? <span className="stock-badge stock-badge--out">Sold Out</span>
                      : isLow
                        ? <span className="stock-badge stock-badge--low">Almost Sold Out — only {aqty} left</span>
                        : null}
                  </div>
                )}
                <div className="cart-row">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={isSoldOut || aqty === null}>−</button>
                    <span className="qty-num">{qty}</span>
                    <button className="qty-btn"
                      onClick={() => setQty(q => aqty !== null ? Math.min(aqty, q + 1) : q + 1)}
                      disabled={isSoldOut || aqty === null || (aqty !== null && qty >= aqty)}>+</button>
                  </div>
                  <button
                    className={`add-to-cart-btn${added ? ' added' : ''}${isSoldOut ? ' sold-out-btn' : ''}`}
                    onClick={!isSoldOut && !needsSize && !needsColor ? handleAddToCart : undefined}
                    disabled={isSoldOut || needsSize || needsColor}
                  >
                    <span>
                      {isSoldOut ? 'Sold Out'
                        : added ? '✓ Added to Bag'
                        : needsSize ? 'Select a Size'
                        : needsColor ? 'Select a Colour'
                        : 'Add to Bag'}
                    </span>
                  </button>
                </div>
              </>
            )
          })()}

          <button className="wishlist-btn">♡ Save to Wishlist</button>

          <div className="trust-row">
            <div className="trust-item"><span>🚚</span> Worldwide Shipping</div>
            <div className="trust-item"><span>↩</span> 14-Day Returns</div>
            <div className="trust-item"><span>🔒</span> Secure Payment</div>
          </div>

          <div className="divider" />

          <div className="accordion">
            {ACCORDIONS.map(acc => (
              <div key={acc.id} className={`accordion-item${openAccordion === acc.id ? ' open' : ''}`}>
                <button className="accordion-trigger" onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}>
                  {acc.label}
                  <div className="accordion-icon" />
                </button>
                <div className="accordion-body">{acc.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="section-related">
          <div className="related-header">
            <h2>You Might Also <em>Love</em></h2>
          </div>
          <div className="related-grid">
            {related.map(p => (
              <div key={p.id} className="related-card" onClick={() => { navigate(`/product/${p.handle}`); window.scrollTo(0, 0) }}>
                <div className="related-card-img">
                  <img src={p.image_url} alt={p.title} loading="lazy" />
                </div>
                <div className="related-card-body">
                  {p.vendor && <div className="related-card-designer">{p.vendor}</div>}
                  <div className="related-card-name">{p.title.split(' - ')[0]}</div>
                  <div className="related-card-price">${Number(p.price).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
