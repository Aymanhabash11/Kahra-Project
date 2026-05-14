import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { loadProducts } from '../lib/utils'
import type { Product as ProductType } from '../lib/types'
import { useCart } from '../context/CartContext'
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

  if (loading) return (
    <div className="not-found"><h2>Loading…</h2></div>
  )
  if (!product) return (
    <div className="not-found">
      <h2>Product not found</h2>
      <Link to="/collection" style={{ color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid var(--gold)' }}>
        Back to Collection
      </Link>
    </div>
  )

  const images = product.all_images?.length ? product.all_images : [product.image_url]

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
            <img src={images[imgIndex]} alt={product.title} />
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
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    className={`size-btn${selectedSize === s ? ' selected' : ''}`}
                    onClick={() => setSelectedSize(s === selectedSize ? '' : s)}
                  >{s}</button>
                ))}
              </div>
            </>
          )}

          {product.colors?.length > 0 && (
            <>
              <div className="option-label">Colour</div>
              <div className="color-grid">
                {product.colors.map((c: string) => (
                  <div
                    key={c}
                    className={`color-swatch${selectedColor === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    title={c}
                    onClick={() => setSelectedColor(c === selectedColor ? '' : c)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="cart-row">
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className={`add-to-cart-btn${added ? ' added' : ''}`} onClick={handleAddToCart}>
              <span>{added ? '✓ Added to Bag' : 'Add to Bag'}</span>
            </button>
          </div>

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
