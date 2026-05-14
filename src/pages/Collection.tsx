import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadProducts, COLLECTIONS, formatName, normalize } from '../lib/utils'
import type { Product } from '../lib/types'
import ProductCard from '../components/ProductCard'
import { SkeletonProductGrid } from '../components/Skeleton'
import '../styles/collection.css'

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name-asc'

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  const activeCategory = searchParams.get('category') ?? ''

  useEffect(() => {
    loadProducts().then(p => { setAllProducts(p); setLoading(false) })
  }, [])

  const filtered = (() => {
    let result = activeCategory
      ? allProducts.filter(p => normalize(p.collection ?? '') === normalize(activeCategory))
      : allProducts

    if (priceMin !== '') result = result.filter(p => Number(p.price) >= Number(priceMin))
    if (priceMax !== '') result = result.filter(p => Number(p.price) <= Number(priceMax))

    if (sortBy === 'price-asc')  result = [...result].sort((a, b) => Number(a.price) - Number(b.price))
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => Number(b.price) - Number(a.price))
    if (sortBy === 'name-asc')   result = [...result].sort((a, b) => a.title.localeCompare(b.title))

    return result
  })()

  function setPill(value: string) {
    if (value) setSearchParams({ category: value })
    else setSearchParams({})
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-label">02.1 The Selections</div>
          <h1>Curated from<br /><em>The Seven Concepts</em></h1>
        </div>
        <div className="product-count">
          {loading ? '' : activeCategory
            ? `${filtered.length} pieces · ${formatName(activeCategory)}`
            : `${filtered.length} pieces across all concepts`}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-label">Concept</div>
        <div className="filter-pills">
          <button className={`pill${!activeCategory ? ' active' : ''}`} onClick={() => setPill('')}>
            All
          </button>
          {COLLECTIONS.map(col => (
            <button
              key={col}
              className={`pill${activeCategory === col ? ' active' : ''}`}
              onClick={() => setPill(col)}
            >
              {formatName(col)}
            </button>
          ))}
        </div>
        <div className="filter-controls">
          <div className="price-range">
            <input
              className="price-input"
              type="number"
              placeholder="$ Min"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              min="0"
            />
            <span className="price-sep">—</span>
            <input
              className="price-input"
              type="number"
              placeholder="$ Max"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              min="0"
            />
          </div>
          <select
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
        </div>
      </div>

      <div className="grid">
        {loading && <SkeletonProductGrid count={8} />}
        {!loading && filtered.length === 0 && (
          <div className="empty">No products found in this collection.</div>
        )}
        {!loading && filtered.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}
