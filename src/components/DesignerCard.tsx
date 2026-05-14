import { useNavigate } from 'react-router-dom'
import type { Designer } from '../lib/types'
import { DESIGNER_ORIGINS } from '../lib/utils'

interface Props {
  designer: Designer
}

export default function DesignerCard({ designer }: Props) {
  const navigate = useNavigate()
  const origin = DESIGNER_ORIGINS[designer.name] ?? designer.origin ?? ''
  const image = designer.image_url ?? (designer.products?.[0]?.image_url ?? '')

  return (
    <div
      className="designer-item reveal"
      onClick={() => navigate(`/designers?designer=${encodeURIComponent(designer.name)}`)}
    >
      {image && <img src={image} alt={designer.name} loading="lazy" />}
      <div className="designer-label">
        <div className="designer-name">{designer.name}</div>
        {origin && <div className="designer-origin">{origin}</div>}
      </div>
    </div>
  )
}
