import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'System Administrator',
  EVALUATOR: 'Evaluator',
  SUPERVISOR_AUDITOR: 'Supervisor / Auditor',
}

const ROLE_RIGHTS: Record<string, { can: string[]; cannot: string[] }> = {
  ADMIN: {
    can: ['Create and suspend accounts', 'Assign roles', 'Activate versioned model and symptom map', 'View all audit events'],
    cannot: ['Create clinical thresholds', 'Enable blood-pressure functionality', 'Alter frozen evaluation data'],
  },
  EVALUATOR: {
    can: ['Create synthetic records', 'Submit supported symptoms', 'View bounded technical outputs', 'View your own assessment history'],
    cannot: ['Manage accounts', 'Change model or symptom-map versions', "Access another evaluator's records", 'Modify audit events'],
  },
  SUPERVISOR_AUDITOR: {
    can: ['View configuration and version metadata', 'View test evidence', 'View audit events'],
    cannot: ['Create or modify records', 'Run administrative operations', 'Change versions', 'Delete audit evidence'],
  },
}

export default function AccountSecurity() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const roleName = user?.role ?? ''
  const rights = ROLE_RIGHTS[roleName] ?? { can: [], cannot: [] }

  const handleSignOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>Account & Security</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Your account details and session security.</p>
      </div>

      <div className="grid-2col" style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Account info */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 14 }}>Account Details</div>
            {[
              { label: 'Username', value: user?.username ?? '—', mono: true },
              { label: 'Account ID', value: user ? `USR-${String(user.id).padStart(3, '0')}` : '—', mono: true },
              { label: 'Role', value: ROLE_LABELS[roleName] ?? '—', mono: false },
              { label: 'Session', value: user ? 'Signed in' : 'Not signed in', mono: false, color: user ? '#16a34a' : '#dc2626' },
            ].map(m => (
              <div key={m.label} className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
                <span style={{ fontSize: 13.5, color: '#6b7280', fontWeight: 500, flexShrink: 0 }}>{m.label}</span>
                <span style={{ fontFamily: m.mono ? "'JetBrains Mono', monospace" : 'inherit', fontSize: m.mono ? 12.5 : 13.5, fontWeight: 600, color: m.color || '#0a1628', textAlign: 'right', wordBreak: 'break-word' }}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Password */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>Password</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
              Self-service password change is not implemented in this prototype. Accounts are created by an administrator, who sets the initial password and transmits it out of band. Passwords are stored only as bcrypt hashes and are never displayed or returned by the API.
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, color: '#6b7280' }}>
              To change a password, contact an administrator.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Session security */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Session Security</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Configured server-side. Values reflect the documented design.</div>
            {[
              { label: 'Session Type', value: 'Signed HTTP-only cookie' },
              { label: 'Inactivity Timeout', value: '15 minutes, sliding' },
              { label: 'SameSite Protection', value: 'Strict' },
              { label: 'Server-side Revocation', value: 'On sign out' },
              { label: 'Password Storage', value: 'bcrypt hash' },
            ].map(m => (
              <div key={m.label} className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, flexShrink: 0 }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0a1628', textAlign: 'right' }}>{m.value}</span>
              </div>
            ))}
            <button onClick={handleSignOut} className="btn-secondary" style={{ marginTop: 14, width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fecaca' }}>
              Sign Out
            </button>
          </div>

          {/* Role info */}
          <div className="card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 12 }}>
              Your role: {ROLE_LABELS[roleName] ?? '—'}
            </div>
            <div style={{ fontSize: 12.5, color: '#0c4a6e', lineHeight: 1.7 }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>You can:</strong>
              {rights.can.map(p => <span key={p}>● {p}<br /></span>)}
            </div>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 12, lineHeight: 1.6 }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>You cannot:</strong>
              {rights.cannot.map(p => <span key={p}>✕ {p}<br /></span>)}
            </div>
            <div style={{ fontSize: 11.5, color: '#0369a1', marginTop: 12, paddingTop: 10, borderTop: '1px solid #bae6fd', lineHeight: 1.5 }}>
              These permissions are enforced by the server on every request, not by this screen.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .grid-2col {
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 900px) {
          .grid-2col {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 420px) {
          .kv-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 4px !important;
          }
          .kv-row span:last-child {
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  )
}