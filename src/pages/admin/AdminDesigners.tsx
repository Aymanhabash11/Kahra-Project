import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Designer } from '../../lib/types'
import { slugify } from '../../lib/utils'
import Modal from '../../components/ui/Modal'
import ImageUploadField from '../../components/ImageUploadField'

const EMPTY: Partial<Designer> = { name: '', handle: '', origin: '', bio: '', image_url: '', website: '' }

export default function AdminDesigners() {
  const [designers, setDesigners] = useState<Designer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<Designer>>(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('designers').select('*').order('name')
    setDesigners((data ?? []) as Designer[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = designers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.origin ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setEditing({ ...EMPTY }); setModal(true) }
  function openEdit(d: Designer) { setEditing({ ...d }); setModal(true) }

  async function save() {
    if (!editing.name) return
    setSaving(true)
    const payload = { ...editing, handle: editing.handle || slugify(editing.name!) }
    if (editing.id) {
      await supabase.from('designers').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('designers').insert(payload)
    }
    setSaving(false); setModal(false); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this designer?')) return
    await supabase.from('designers').delete().eq('id', id)
    setDesigners(prev => prev.filter(d => d.id !== id))
  }

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Designers</h1><p>Manage your curated designers</p></div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">{designers.length} Designers</span>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input className="admin-search" placeholder="Search designers…" value={search} onChange={e => setSearch(e.target.value)} />
            <button className="admin-add-btn" onClick={openAdd}>+ Add Designer</button>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Origin</th>
                <th>Website</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    {d.image_url
                      ? <img src={d.image_url} alt="" className="admin-table-img" />
                      : <div style={{ width: 48, height: 60, background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>◇</div>
                    }
                  </td>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.origin}</td>
                  <td>{d.website ? <a href={d.website} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>↗</a> : '—'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-action-btn" onClick={() => openEdit(d)}>Edit</button>
                      <button className="admin-action-btn delete" onClick={() => remove(d.id)}>Delete</button>
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
        title={editing.id ? 'Edit Designer' : 'Add Designer'}
        footer={
          <>
            <button className="admin-cancel-btn" onClick={() => setModal(false)}>Cancel</button>
            <button className="admin-save-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Designer'}</button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field full">
            <label className="admin-field-label">Name *</label>
            <input className="admin-field-input" value={editing.name ?? ''} onChange={e => setEditing(f => ({ ...f, name: e.target.value, handle: slugify(e.target.value) }))} placeholder="Designer name" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Origin / Location</label>
            <input className="admin-field-input" value={editing.origin ?? ''} onChange={e => setEditing(f => ({ ...f, origin: e.target.value }))} placeholder="City, Country" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Website</label>
            <input className="admin-field-input" type="url" value={editing.website ?? ''} onChange={e => setEditing(f => ({ ...f, website: e.target.value }))} placeholder="https://…" />
          </div>
          <ImageUploadField
            label="Image"
            value={editing.image_url ?? ''}
            onChange={url => setEditing(f => ({ ...f, image_url: url }))}
          />
          <div className="admin-field full">
            <label className="admin-field-label">Bio</label>
            <textarea className="admin-field-textarea" value={editing.bio ?? ''} onChange={e => setEditing(f => ({ ...f, bio: e.target.value }))} placeholder="A short bio about the designer…" />
          </div>
        </div>
      </Modal>
    </>
  )
}
