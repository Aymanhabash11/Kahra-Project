import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { JournalPost } from '../../lib/types'
import { slugify, JOURNAL_CATEGORIES } from '../../lib/utils'
import Modal from '../../components/ui/Modal'
import ImageUploadField from '../../components/ImageUploadField'
import RichTextEditor from '../../components/RichTextEditor'

const EMPTY: Partial<JournalPost> = { title: '', slug: '', excerpt: '', content: '', cover_image: '', category: '', author: 'House of Nomad Stories', published: false }

export default function AdminJournal() {
  const [posts, setPosts] = useState<JournalPost[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<JournalPost>>(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('journal_posts').select('*').order('created_at', { ascending: false })
    setPosts((data ?? []) as JournalPost[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setEditing({ ...EMPTY }); setModal(true) }
  function openEdit(p: JournalPost) { setEditing({ ...p }); setModal(true) }

  async function save() {
    if (!editing.title) return
    setSaving(true)
    const payload = {
      ...editing,
      slug: editing.slug || slugify(editing.title!),
      updated_at: new Date().toISOString(),
      published_at: editing.published && !editing.published_at ? new Date().toISOString() : editing.published_at,
    }
    if (editing.id) {
      await supabase.from('journal_posts').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('journal_posts').insert(payload)
    }
    setSaving(false); setModal(false); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this post?')) return
    await supabase.from('journal_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  async function togglePublish(post: JournalPost) {
    const published = !post.published
    await supabase.from('journal_posts').update({
      published,
      published_at: published ? new Date().toISOString() : null,
    }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published } : p))
  }

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Journal</h1><p>Manage posts and editorial content</p></div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">{posts.length} Posts</span>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input className="admin-search" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} />
            <button className="admin-add-btn" onClick={openAdd}>+ New Post</button>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Category</th>
                <th>Published</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.cover_image
                      ? <img src={p.cover_image} alt="" className="admin-table-img" />
                      : <div style={{ width: 48, height: 60, background: 'var(--sand)' }} />
                    }
                  </td>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.category}</td>
                  <td>
                    <span
                      className={`admin-published-badge ${p.published ? 'yes' : 'no'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => togglePublish(p)}
                      title="Click to toggle"
                    >
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {p.published_at ? new Date(p.published_at).toLocaleDateString('en-GB') : '—'}
                  </td>
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
        title={editing.id ? 'Edit Post' : 'New Journal Post'}
        wide
        footer={
          <>
            <button className="admin-cancel-btn" onClick={() => setModal(false)}>Cancel</button>
            <button className="admin-save-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Post'}</button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field full">
            <label className="admin-field-label">Title *</label>
            <input className="admin-field-input" value={editing.title ?? ''} onChange={e => setEditing(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))} placeholder="Post title" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Slug</label>
            <input className="admin-field-input" value={editing.slug ?? ''} onChange={e => setEditing(f => ({ ...f, slug: e.target.value }))} />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Category</label>
            <select className="admin-field-select" value={editing.category ?? ''} onChange={e => setEditing(f => ({ ...f, category: e.target.value }))}>
              <option value="">— Select —</option>
              {JOURNAL_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Author</label>
            <input className="admin-field-input" value={editing.author ?? ''} onChange={e => setEditing(f => ({ ...f, author: e.target.value }))} />
          </div>
          <ImageUploadField
            label="Cover Image"
            value={editing.cover_image ?? ''}
            onChange={url => setEditing(f => ({ ...f, cover_image: url }))}
          />
          <div className="admin-field full">
            <label className="admin-field-label">Excerpt</label>
            <textarea className="admin-field-textarea" style={{ minHeight: '80px' }} value={editing.excerpt ?? ''} onChange={e => setEditing(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary…" />
          </div>
          <div className="admin-field full">
            <label className="admin-field-label">Content</label>
            <RichTextEditor
              value={editing.content ?? ''}
              onChange={html => setEditing(f => ({ ...f, content: html }))}
            />
          </div>
          <div className="admin-field full">
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={editing.published ?? false} onChange={e => setEditing(f => ({ ...f, published: e.target.checked }))} />
              Published
            </label>
          </div>
        </div>
      </Modal>
    </>
  )
}
