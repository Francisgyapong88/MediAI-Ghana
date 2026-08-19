import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from '../Logo'
import { useAuth } from '../../context/AuthContext'
import SignOutButton from '../SignOutButton'

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
    ],
  },
]

export default function SupervisorLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#eef2f7', overflow: 'hidden' }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#0a1020', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Logo size="full" />
            <div style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#7c3aed', textTransform: 'uppercase' }}>
              Supervisor / Auditor
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
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
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                >
                  <span style={{ fontSize: 12 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Opens inline within the review shell, reusing the same public
            TechnicalEvaluation page component via the /review/evaluation route. */}
        <div style={{ padding: '0 8px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', padding: '4px 12px', marginBottom: 4, textTransform: 'uppercase' }}>
            PUBLIC RECORD
          </div>
          <NavLink
            to="/review/evaluation"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 12 }}>📈</span>
            Technical Evaluation
          </NavLink>
        </div>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username ?? '—'}</div>
            <div style={{ fontSize: 10.5, color: '#a78bfa', fontWeight: 600 }}>Read-only</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div
          className="supervisor-topbar md:px-6"
          style={{ height: 56, background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0a1628', whiteSpace: 'nowrap' }}>
              <span className="hidden sm:inline">MediAI Ghana — Review</span>
              <span className="sm:hidden">MediAI Ghana</span>
            </span>
            <span className="research-badge hidden sm:inline-flex">Research Prototype</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="hidden sm:inline" style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '3px 9px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Read-only access
            </span>
            <SignOutButton />
          </div>
        </div>
        <div className="p-4 md:p-6" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function HamburgerIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="#0a1628" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}