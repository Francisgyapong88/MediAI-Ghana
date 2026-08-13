import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../Logo'
import { useAuth } from '../../context/AuthContext'

// Every entry here is read-only. The supervisor/auditor permission set
// contains no mutations (FR-10), so no nav item leads to a write action.
const navSections = [
  {
    label: 'EVIDENCE',
    items: [
      { to: '/review/audit', label: 'Audit Events', icon: '📋' },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { to: '/review/model', label: 'Model Information', icon: '🔬' },
      { to: '/review/model-versions', label: 'Model Versions', icon: '🔢' },
      { to: '/review/symptom-map', label: 'Symptom Map', icon: '🗂' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/review/status', label: 'System Status', icon: '📡' },
      { to: '/review/account', label: 'Account & Security', icon: '🛡' },
      { to: '/review/docs', label: 'Documentation', icon: '📖' },
    ],
  },
]

export default function SupervisorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#eef2f7', overflow: 'hidden' }}>
      <div style={{ width: 240, background: '#0a1020', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Logo size="full" />
          <div style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#7c3aed', textTransform: 'uppercase' }}>
            Supervisor / Auditor
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navSections.map(section => (
            <div key={section.label} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', padding: '4px 12px', marginBottom: 4, textTransform: 'uppercase' }}>
                {section.label}
              </div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                >
                  <span style={{ fontSize: 12 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Published publicly by design — opens the same page any reviewer
            reads, rather than a role-specific copy. */}
        <div style={{ padding: '0 8px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', padding: '4px 12px', marginBottom: 4, textTransform: 'uppercase' }}>
            PUBLIC RECORD
          </div>
          <a
            href="/evaluation"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-nav-item"
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontSize: 12 }}>📈</span>
            Technical Evaluation
            <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.4 }}>↗</span>
          </a>
        </div>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>{user?.username ?? '—'}</div>
            <div style={{ fontSize: 10.5, color: '#a78bfa', fontWeight: 600 }}>Read-only</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 56, background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0a1628' }}>MediAI Ghana — Review</span>
            <span className="research-badge">Research Prototype</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '3px 9px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Read-only access
            </span>
            <button onClick={handleSignOut} style={{ fontSize: 12.5, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
              Sign Out
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
