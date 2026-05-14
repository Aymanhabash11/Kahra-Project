import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/auth.css'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', adminCode: '' })
  const [showAdminCode, setShowAdminCode] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const err = await signUp(form.email, form.password, form.fullName, form.adminCode || undefined)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80" alt="" />
        <div className="auth-image-overlay">
          <div className="auth-image-brand">
            KAHRA<em>Studio Group</em>
          </div>
          <p className="auth-image-tagline">
            Join an intimate circle of discerning guests across KAFD, Shura Island, and AMAALA.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <Link to="/" className="auth-logo">KAHRA Studio Group</Link>

        <h1 className="auth-heading">Create your <em>account</em></h1>
        <p className="auth-subheading">Join to save your selections and access our private editorial.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input className="auth-input" type="text" placeholder="Your name" value={form.fullName} onChange={set('fullName')} required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input className="auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          {showAdminCode && (
            <div className="auth-field">
              <label className="auth-label">Admin Code (optional)</label>
              <input className="auth-input" type="text" placeholder="Enter admin code if you have one" value={form.adminCode} onChange={set('adminCode')} />
              <div className="auth-admin-code">
                Entering a valid admin code will grant you admin access to manage the store.
              </div>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
        <p className="auth-toggle" style={{ marginTop: '0.5rem', fontSize: '0.68rem' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'Jost, sans-serif', fontSize: '0.68rem' }}
            onClick={() => setShowAdminCode(s => !s)}
          >
            {showAdminCode ? 'Hide admin code' : 'Have an admin code?'}
          </button>
        </p>
      </div>
    </div>
  )
}
