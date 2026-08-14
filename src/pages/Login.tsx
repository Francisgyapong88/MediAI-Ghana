import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { homeFor } from '../components/ProtectedRoute'

type ErrorType = 'invalid' | 'suspended' | 'ratelimit' | 'unavailable' | null

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.2 4.3A7.6 7.6 0 0110 4.2c4 0 7 3 8 5.8a11 11 0 01-2.5 3.4M5.2 6A11 11 0 002 10c1 2.8 4 5.8 8 5.8a7.6 7.6 0 002.9-.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.3 8.5a2.4 2.4 0 003.3 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10c1-2.8 4-5.8 8-5.8s7 3 8 5.8c-1 2.8-4 5.8-8 5.8S3 12.8 2 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<ErrorType>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(username, password)
      navigate(homeFor(user.role))
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 0) setError('unavailable')
        else if (err.status === 429) setError('ratelimit')
        else if (err.code === 'AccountNotActive') setError('suspended')
        else if (err.status === 401 || err.status === 400) setError('invalid')
        else setError('unavailable')
      } else {
        setError('unavailable')
      }
    } finally {
      setLoading(false)
    }
  }

  const errorMessages: Record<NonNullable<ErrorType>, { title: string; desc: string }> = {
    invalid: { title: 'Invalid credentials', desc: 'The username or password you entered is incorrect. Please try again.' },
    suspended: { title: 'Account suspended', desc: 'This account has been suspended by a system administrator. Contact support.' },
    ratelimit: { title: 'Too many attempts', desc: 'Authentication rate limit reached. Please wait before trying again.' },
    unavailable: { title: 'Service unavailable', desc: 'The authentication service could not be reached. Your credentials have not been checked. Please try again shortly.' },
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Left panel */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #f0fdfa 0%, #ffffff 55%, #f8fafc 100%)', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 60%, rgba(13,148,136,0.09) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }}>
            <Logo size="full" />
          </NavLink>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="research-badge" style={{ marginBottom: 20 }}>Research Prototype</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16 }}>
            Technical Decision Support.<br />
            <span style={{ color: '#0d9488' }}>Human Judgement First.</span>
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.7, maxWidth: 400 }}>
            Structured symptom capture, bounded machine-learning classification and transparent technical evaluation for academic demonstration.
          </p>

          {/* Security indicators */}
          <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'HTTP-only Cookies', icon: '🔒' },
              { label: 'SameSite Protection', icon: '🛡' },
              { label: '15-min Inactivity Timeout', icon: '⏱' },
              { label: 'Rate Limiting Active', icon: '🚦' },
              { label: 'Server-side Sessions', icon: '🔐' },
              { label: 'Bcrypt Password Hashing', icon: '🔑' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                <span style={{ fontSize: 11.5, color: '#475569', fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 11, color: '#94a3b8' }}>
          Not for Clinical Diagnosis · Authorised Access Only · Synthetic Records Only
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Welcome to MediAI Ghana
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
              Authorised access to the clinical decision-support research prototype.
            </p>
          </div>

          {error && (
            <div style={{
              background: error === 'unavailable' ? '#f8fafc' : '#fef2f2',
              border: `1px solid ${error === 'unavailable' ? '#cbd5e1' : '#fecaca'}`,
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: error === 'unavailable' ? '#334155' : '#dc2626', marginBottom: 2 }}>
                {errorMessages[error].title}
              </div>
              <div style={{ fontSize: 12.5, color: error === 'unavailable' ? '#475569' : '#b91c1c' }}>
                {errorMessages[error].desc}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 44, width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    color: showPassword ? '#0d9488' : '#9ca3af',
                    cursor: 'pointer',
                    borderRadius: 6,
                  }}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                Password reset is administrator-managed
              </span>
            </div>

            <button type="submit" className="btn-navy" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: '#16a34a', fontSize: 15, flexShrink: 0 }}>ℹ</span>
            <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
              This application uses synthetic demonstration records only. No real patient data is stored or processed.
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500 }}>Secure session</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500 }}>Authorised users only</span>
            </div>
          </div>

          <div style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: '#d1d5db', fontWeight: 500, letterSpacing: '0.04em' }}>
            No public registration · No social login · Prototype access only
          </div>
        </div>
      </div>
    </div>
  )
}