import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product, Designer, ProductVariant } from '../../lib/types'
import { slugify, COLLECTIONS } from '../../lib/utils'
import Modal from '../../components/ui/Modal'
import ImageUploadField from '../../components/ImageUploadField'
import { SkeletonAdminTable } from '../../components/Skeleton'

const EMPTY: Partial<Product> = { title: '', handle: '', price: 0, currency: 'USD', collection: '', vendor: '', image_url: '', description: '', materials: '', in_stock: true, sizes: [], colors: [], quantity: 0, size_quantities: {}, variants: [], color_images: {} }

/* ── Tag-chip input ────────────────────────────────────────── */
function TagInput({ values, placeholder, onAdd, onRemove }: {
  values: string[]
  placeholder?: string
  onAdd: (val: string) => void
  onRemove: (val: string) => void
}) {
  const [draft, setDraft] = useState('')

  function commit() {
    const v = draft.trim()
    if (v && !values.includes(v)) onAdd(v)
    setDraft('')
  }

  return (
    <div className="tag-input-wrap" onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      {values.map(v => (
        <span key={v} className="tag-chip">
          {v}
          <button type="button" className="tag-chip-x" onClick={e => { e.stopPropagation(); onRemove(v) }}>×</button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={draft}
        placeholder={values.length === 0 ? placeholder : 'Type and press Enter…'}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
          if (e.key === 'Backspace' && !draft && values.length) onRemove(values[values.length - 1])
        }}
        onBlur={commit}
      />
    </div>
  )
}

/* ── Compact color image uploader ────────────────────────── */
function ColorImageUpload({ color, value, onChange }: { color: string; value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('admin-uploads').upload(path, file, { upsert: false })
    if (!error) {
      const { data } = supabase.storage.from('admin-uploads').getPublicUrl(path)
      onChange(data.publicUrl)
    }
    setUploading(false)
  }

  const isHex = color.startsWith('#')

  return (
    <div className="color-img-row">
      <div className="color-img-label">
        <span className="vm-color-dot" style={isHex ? { background: color } : {}} />
        <strong>{color}</strong>
      </div>
      <div className="color-img-controls">
        {value && <img src={value} className="color-img-thumb" alt={color} />}
        <input
          className="admin-field-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste image URL…"
        />
        <button type="button" className="admin-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '…' : 'Upload'}
        </button>
        {value && (
          <button type="button" className="image-upload-clear" style={{ position: 'static', transform: 'none' }} onClick={() => onChange('')}>×</button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }} />
    </div>
  )
}

/** Rebuild variants array to match current sizes × colors, preserving existing quantities */
function syncVariants(sizes: string[], colors: string[], current: ProductVariant[]): ProductVariant[] {
  if (sizes.length === 0 && colors.length === 0) return []
  const pairs: { size: string; color: string }[] =
    sizes.length > 0 && colors.length > 0
      ? sizes.flatMap(s => colors.map(c => ({ size: s, color: c })))
      : sizes.length > 0
        ? sizes.map(s => ({ size: s, color: '' }))
        : colors.map(c => ({ size: '', color: c }))
  return pairs.map(({ size, color }) => {
    const existing = current.find(v => v.size === size && v.color === color)
    return { size, color, quantity: existing?.quantity ?? 0 }
  })
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [designers, setDesigners] = useState<Designer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('designers').select('id, name').order('name'),
    ])
    setProducts((p ?? []) as Product[])
    setDesigners((d ?? []) as Designer[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.collection ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setEditing({ ...EMPTY }); setModal(true) }
  function openEdit(p: Product) { setEditing({ ...p }); setModal(true) }

  async function save() {
    if (!editing.title) return
    setSaving(true)
    const variants = (editing.variants as ProductVariant[]) ?? []
    const totalQty = variants.length
      ? variants.reduce((sum, v) => sum + v.quantity, 0)
      : Number(editing.quantity) || 0
    const payload = {
      ...editing,
      price: Number(editing.price) || 0,
      quantity: totalQty,
      variants,
      color_images: (editing.color_images as Record<string, string>) ?? {},
      in_stock: totalQty > 0,
      handle: editing.handle || slugify(editing.title!),
      updated_at: new Date().toISOString(),
    }
    if (editing.id) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(payload)
    }
    setSaving(false); setModal(false); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Products</h1><p>Manage your product catalogue</p></div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">{products.length} Products</span>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input className="admin-search" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
            <button className="admin-add-btn" onClick={openAdd}>+ Add Product</button>
          </div>
        </div>

        {loading ? (
          <SkeletonAdminTable cols={7} rows={6} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Collection</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><img src={p.image_url} alt="" className="admin-table-img" /></td>
                  <td><strong>{p.title}</strong><br /><span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{p.vendor}</span></td>
                  <td>{p.collection}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.quantity ?? 0}</td>
                  <td><span className={`admin-published-badge ${p.in_stock ? 'yes' : 'no'}`}>{p.in_stock ? 'In Stock' : 'Out'}</span></td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-action-btn" onClick={() => openEdit(p)}>Edit</button>
                      <button className="admin-action-btn delete" onClick={() => remove(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing.id ? 'Edit Product' : 'Add Product'}
        footer={
          <>
            <button className="admin-cancel-btn" onClick={() => setModal(false)}>Cancel</button>
            <button className="admin-save-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field full">
            <label className="admin-field-label">Title *</label>
            <input className="admin-field-input" value={editing.title ?? ''} onChange={e => setEditing(f => ({ ...f, title: e.target.value, handle: slugify(e.target.value) }))} placeholder="Product title" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Price ($)</label>
            <input className="admin-field-input" type="number" value={editing.price ?? ''} onChange={e => setEditing(f => ({ ...f, price: e.target.value === '' ? undefined : parseFloat(e.target.value) }))} step="0.01" min="0" />
          </div>
          {((editing.sizes as string[] | undefined) ?? []).length === 0 && (
            <div className="admin-field">
              <label className="admin-field-label">Quantity in Stock</label>
              <input className="admin-field-input" type="number" min="0" value={editing.quantity ?? 0} onChange={e => setEditing(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} />
            </div>
          )}
          <div className="admin-field">
            <label className="admin-field-label">Collection</label>
            <select className="admin-field-select" value={editing.collection ?? ''} onChange={e => setEditing(f => ({ ...f, collection: e.target.value }))}>
              <option value="">— Select —</option>
              {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Designer / Vendor</label>
            <select className="admin-field-select" value={editing.vendor ?? ''} onChange={e => setEditing(f => ({ ...f, vendor: e.target.value }))}>
              <option value="">— Select —</option>
              {designers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Handle (URL slug)</label>
            <input className="admin-field-input" value={editing.handle ?? ''} onChange={e => setEditing(f => ({ ...f, handle: e.target.value }))} />
          </div>
          <ImageUploadField
            label="Image"
            value={editing.image_url ?? ''}
            onChange={url => setEditing(f => ({ ...f, image_url: url }))}
          />
          <div className="admin-field full">
            <label className="admin-field-label">Description</label>
            <textarea className="admin-field-textarea" value={editing.description ?? ''} onChange={e => setEditing(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="admin-field full">
            <label className="admin-field-label">Materials & Care</label>
            <textarea className="admin-field-textarea" style={{ minHeight: '80px' }} value={editing.materials ?? ''} onChange={e => setEditing(f => ({ ...f, materials: e.target.value }))} />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Sizes</label>
            <TagInput
              values={(editing.sizes as string[] | undefined) ?? []}
              placeholder="Type a size, press Enter (e.g. XS, S, M…)"
              onAdd={size => {
                const sizes = [...((editing.sizes as string[] | undefined) ?? []), size]
                const colors = (editing.colors as string[] | undefined) ?? []
                const current = (editing.variants as ProductVariant[]) ?? []
                setEditing(f => ({ ...f, sizes, variants: syncVariants(sizes, colors, current) }))
              }}
              onRemove={size => {
                const sizes = ((editing.sizes as string[] | undefined) ?? []).filter(s => s !== size)
                const colors = (editing.colors as string[] | undefined) ?? []
                const current = (editing.variants as ProductVariant[]) ?? []
                setEditing(f => ({ ...f, sizes, variants: syncVariants(sizes, colors, current) }))
              }}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Colors</label>
            <TagInput
              values={(editing.colors as string[] | undefined) ?? []}
              placeholder="Type a color, press Enter (e.g. Red, Blue…)"
              onAdd={color => {
                const colors = [...((editing.colors as string[] | undefined) ?? []), color]
                const sizes = (editing.sizes as string[] | undefined) ?? []
                const current = (editing.variants as ProductVariant[]) ?? []
                setEditing(f => ({ ...f, colors, variants: syncVariants(sizes, colors, current) }))
              }}
              onRemove={color => {
                const colors = ((editing.colors as string[] | undefined) ?? []).filter(c => c !== color)
                const sizes = (editing.sizes as string[] | undefined) ?? []
                const current = (editing.variants as ProductVariant[]) ?? []
                const imgs = { ...((editing.color_images as Record<string, string>) ?? {}) }
                delete imgs[color]
                setEditing(f => ({ ...f, colors, variants: syncVariants(sizes, colors, current), color_images: imgs }))
              }}
            />
          </div>

          {/* Color images */}
          {((editing.colors as string[] | undefined) ?? []).length > 0 && (
            <div className="admin-field full">
              <label className="admin-field-label">Image per Color</label>
              <div className="color-imgs-list">
                {((editing.colors as string[] | undefined) ?? []).map(c => (
                  <ColorImageUpload
                    key={c}
                    color={c}
                    value={((editing.color_images as Record<string, string>) ?? {})[c] ?? ''}
                    onChange={url => setEditing(f => ({
                      ...f,
                      color_images: { ...((f.color_images as Record<string, string>) ?? {}), [c]: url }
                    }))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Variant stock matrix ── */}
          {(() => {
            const sizes = (editing.sizes as string[] | undefined) ?? []
            const colors = (editing.colors as string[] | undefined) ?? []
            const variants = (editing.variants as ProductVariant[]) ?? []
            if (sizes.length === 0 && colors.length === 0) return null

            function getQty(s: string, c: string) {
              return variants.find(v => v.size === s && v.color === c)?.quantity ?? 0
            }
            function setQty(s: string, c: string, qty: number) {
              setEditing(f => {
                const vs = [...((f.variants as ProductVariant[]) ?? [])]
                const idx = vs.findIndex(v => v.size === s && v.color === c)
                if (idx >= 0) vs[idx] = { ...vs[idx], quantity: qty }
                return { ...f, variants: vs }
              })
            }

            // Full size × color matrix
            if (sizes.length > 0 && colors.length > 0) {
              return (
                <div className="admin-field full">
                  <label className="admin-field-label">Stock per Variant (size × color)</label>
                  <div className="variant-matrix" style={{ gridTemplateColumns: `auto repeat(${colors.length}, 1fr)` }}>
                    <div className="vm-corner" />
                    {colors.map(c => (
                      <div key={c} className="vm-col-header">
                        <span className="vm-color-dot" style={{ background: c.startsWith('#') ? c : undefined }} />
                        {c}
                      </div>
                    ))}
                    {sizes.flatMap(s => [
                      <div key={`rh-${s}`} className="vm-row-header">{s}</div>,
                      ...colors.map(c => (
                        <div key={`${s}-${c}`} className="vm-cell">
                          <input
                            className="vm-input"
                            type="number" min="0"
                            value={getQty(s, c)}
                            onChange={e => setQty(s, c, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      ))
                    ])}
                  </div>
                  <p className="variant-note">Total quantity is the sum of all variants.</p>
                </div>
              )
            }

            // Only sizes
            if (sizes.length > 0) {
              return (
                <div className="admin-field full">
                  <label className="admin-field-label">Stock per Size</label>
                  <div className="variant-row">
                    {sizes.map(s => (
                      <div key={s} className="variant-cell">
                        <div className="variant-cell-label">{s}</div>
                        <input className="vm-input" type="number" min="0"
                          value={getQty(s, '')}
                          onChange={e => setQty(s, '', parseInt(e.target.value) || 0)} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            // Only colors
            return (
              <div className="admin-field full">
                <label className="admin-field-label">Stock per Color</label>
                <div className="variant-row">
                  {colors.map(c => (
                    <div key={c} className="variant-cell">
                      <div className="variant-cell-label">
                        <span className="vm-color-dot" style={{ background: c.startsWith('#') ? c : undefined }} />
                        {c}
                      </div>
                      <input className="vm-input" type="number" min="0"
                        value={getQty('', c)}
                        onChange={e => setQty('', c, parseInt(e.target.value) || 0)} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
          <div className="admin-field full">
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={editing.in_stock ?? true} onChange={e => setEditing(f => ({ ...f, in_stock: e.target.checked }))} />
              In Stock
            </label>
          </div>
        </div>
      </Modal>
    </>
  )
}
