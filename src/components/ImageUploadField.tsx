import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
}

export default function ImageUploadField({ label, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('admin-uploads')
      .upload(path, file, { upsert: false })
    if (uploadErr) {
      setError(uploadErr.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('admin-uploads').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="admin-field full">
      <label className="admin-field-label">{label}</label>
      {value && (
        <div className="image-upload-preview">
          <img src={value} alt="Preview" />
          <button type="button" className="image-upload-clear" onClick={() => onChange('')}>×</button>
        </div>
      )}
      <div className="image-upload-controls">
        <input
          className="admin-field-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste a URL or click Upload…"
        />
        <button
          type="button"
          className="admin-upload-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <span className="image-upload-error">{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
      />
    </div>
  )
}
