import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import '../styles/profile.css'

type Tab = 'details' | 'security'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('details')
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  if (!user || !profile) return null

  const initials = (profile.full_name ?? profile.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user!.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword) return
    setPwSaving(true)
    await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false); setPwSaved(true); setNewPassword('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-header-info">
          <div className="profile-name">{profile.full_name || 'Welcome'}</div>
          <div className="profile-email">{profile.email ?? user.email}</div>
          <span className="profile-role-badge">{profile.role}</span>
        </div>
      </div>

      <div className="profile-body">
        <nav className="profile-nav">
          <button className={`profile-nav-item${tab === 'details' ? ' active' : ''}`} onClick={() => setTab('details')}>
            Account Details
          </button>
          <button className={`profile-nav-item${tab === 'security' ? ' active' : ''}`} onClick={() => setTab('security')}>
            Security
          </button>
          {profile.role === 'admin' && (
            <button className="profile-nav-item" onClick={() => navigate('/admin/dashboard')}>
              Admin Panel
            </button>
          )}
        </nav>

        <div>
          {tab === 'details' && (
            <div className="profile-section">
              <div className="profile-section-title">Account Details</div>
              <div className="profile-section-sub">Update your personal information.</div>
              <form onSubmit={saveDetails}>
                <div className="profile-field">
                  <label className="profile-label">Full Name</label>
                  <input
                    className="profile-input"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-label">Email Address</label>
                  <input className="profile-input" type="email" value={user.email ?? ''} disabled style={{ opacity: 0.6 }} />
                </div>
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                {saved && <div className="profile-success-msg">✓ Changes saved successfully.</div>}
              </form>
              <button
                className="profile-signout-btn"
                onClick={() => signOut().then(() => navigate('/'))}
              >
                Sign Out
              </button>
            </div>
          )}

          {tab === 'security' && (
            <div className="profile-section">
              <div className="profile-section-title">Security</div>
              <div className="profile-section-sub">Update your password.</div>
              <form onSubmit={savePassword}>
                <div className="profile-field">
                  <label className="profile-label">New Password</label>
                  <input
                    className="profile-input"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>
                <button type="submit" className="profile-save-btn" disabled={pwSaving || !newPassword}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
                {pwSaved && <div className="profile-success-msg">✓ Password updated successfully.</div>}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
