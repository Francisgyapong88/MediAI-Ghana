import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from '../Logo'
import { useAuth } from '../../context/AuthContext'
import SignOutButton from '../SignOutButton'

const navSections = [
  {
    label: 'MAIN',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
      { to: '/admin/history', label: 'Assessment History', icon: '⏱' },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { to: '/admin/users', label: 'Users & Roles', icon: '👥' },
      { to: '/admin/model-versions', label: 'Model Versions', icon: '🔢' },
      { to: '/admin/symptom-versions', label: 'Symptom Map Versions', icon: '🗂' },
      { to: '/admin/audit', label: 'System Audit', icon: '📋' },
      { to: '/admin/retention', label: 'Retention Config', icon: '💾' },
    ],
  },
  {
    label: 'SECURITY',
    items: [
      { to: '/admin/account', label: 'Account & Security', icon: '🛡' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/admin/status', label: 'System Status', icon: '📡' },
      { to: '/admin/docs', label: 'Documentation', icon: '📖' },
    ],
  },
]

export default function AdminLayout() {
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
        style={{ background: '#060d1a', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Logo size="full" />
            <div style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#d97706', textTransform: 'uppercase' }}>
              System Administrator
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

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username ?? '—'}</div>
            <div style={{ fontSize: 10.5, color: '#d97706', fontWeight: 600 }}>Administrator</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div className="md:px-6" style={{ height: 56, background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0a1628', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
  <span className="hidden sm:inline">MediAI Ghana — Administration</span>
  <span className="sm:hidden">MediAI Ghana</span>
</span>
            <span className="research-badge hidden sm:inline-flex">Research Prototype</span>
          </div>
          <SignOutButton />
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