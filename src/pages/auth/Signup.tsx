import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import '../../styles/auth.css'

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function getStrength(pw: string): { score: number; label: string; level: string } {
  if (!pw) return { score: 0, label: '', level: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score: 1, label: 'Weak', level: 'weak' }
  if (score === 2) return { score: 2, label: 'Fair', level: 'fair' }
  if (score === 3) return { score: 3, label: 'Good', level: 'good' }
  return { score: 4, label: 'Strong', level: 'strong' }
}

export default function Signup() {
  const { signUp } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', adminCode: '' })
  const [showAdminCode, setShowAdminCode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const strength = getStrength(form.password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const err = await signUp(form.email, form.password, form.fullName, form.adminCode || undefined, form.phone || undefined)
    setLoading(false)
    if (err) { setError(err); return }
    showToast(`Welcome, ${form.fullName.split(' ')[0]} — your account is ready.`, 'success')
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
            <label className="auth-label">Phone Number</label>
            <input className="auth-input" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`auth-strength-bar${strength.score >= i ? ` auth-strength-bar--${strength.level}` : ''}`}
                    />
                  ))}
                </div>
                <span className={`auth-strength-label auth-strength-label--${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}
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
