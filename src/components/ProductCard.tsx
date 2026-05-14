import { useNavigate } from 'react-router-dom'
import type { Product } from '../lib/types'

interface Props {
  product: Product
  showDesignerTag?: boolean
}

export default function ProductCard({ product, showDesignerTag }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className="card"
      onClick={() => navigate(`/product/${product.handle}`)}
    >
      <div className="card-image">
        <img src={product.image_url} alt={product.title} loading="lazy" />
        {showDesignerTag && product.vendor && (
          <span className="card-designer-tag">{product.vendor}</span>
        )}
      </div>
      <div className="card-content">
        <div className="title">{product.title}</div>
        <div className="price">{Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  )
}
