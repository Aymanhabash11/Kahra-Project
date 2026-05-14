import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product, Designer } from '../../lib/types'
import { slugify, COLLECTIONS } from '../../lib/utils'
import Modal from '../../components/ui/Modal'
import ImageUploadField from '../../components/ImageUploadField'

const EMPTY: Partial<Product> = { title: '', handle: '', price: 0, currency: 'USD', collection: '', vendor: '', image_url: '', description: '', materials: '', in_stock: true, sizes: [], colors: [], quantity: 0 }

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
    const payload = {
      ...editing,
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
          <div className="admin-loading">Loading…</div>
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
            <input className="admin-field-input" type="number" value={editing.price ?? ''} onChange={e => setEditing(f => ({ ...f, price: parseFloat(e.target.value) }))} step="0.01" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Quantity in Stock</label>
            <input className="admin-field-input" type="number" min="0" value={editing.quantity ?? 0} onChange={e => setEditing(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} />
          </div>
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
            <label className="admin-field-label">Sizes (comma-separated)</label>
            <input className="admin-field-input" value={(editing.sizes as string[] | undefined)?.join(', ') ?? ''} onChange={e => setEditing(f => ({ ...f, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="XS, S, M, L, XL" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Colors (comma-separated hex or names)</label>
            <input className="admin-field-input" value={(editing.colors as string[] | undefined)?.join(', ') ?? ''} onChange={e => setEditing(f => ({ ...f, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="#c9a96e, #2a2520" />
          </div>
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
