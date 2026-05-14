import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/auth.css'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const err = await signIn(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80" alt="" />
        <div className="auth-image-overlay">
          <div className="auth-image-brand">
            KAHRA<em>Studio Group</em>
          </div>
          <p className="auth-image-tagline">
            A luxury retail concept company blending international design with Saudi craftsmanship.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <Link to="/" className="auth-logo">KAHRA Studio Group</Link>

        <h1 className="auth-heading">Welcome <em>back</em></h1>
        <p className="auth-subheading">Sign in to access your saved bag and account.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account? <Link to="/signup">Create one →</Link>
        </p>
      </div>
    </div>
  )
}
