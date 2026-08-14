import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from '../Logo'
import { useAuth } from '../../context/AuthContext'
import SignOutButton from '../SignOutButton'

// Only EVALUATOR and ADMIN reach this layout — the read-only role has its
// own area at /review. Role-filtering the nav here would be dead code.
const navSections = [
  {
    label: 'MAIN',
    items: [
      { to: '/app/dashboard', label: 'Dashboard', icon: <GridIcon /> },
      { to: '/app/new-assessment', label: 'New Assessment', icon: <PlusIcon /> },
      { to: '/app/history', label: 'Assessment History', icon: <ClockIcon /> },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { to: '/app/model', label: 'Model Information', icon: <CpuIcon /> },
      { to: '/app/symptom-map', label: 'Symptom Map', icon: <MapIcon /> },
    ],
  },
  {
    label: 'SECURITY',
    items: [
      { to: '/app/account', label: 'Account & Security', icon: <ShieldIcon /> },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/app/status', label: 'System Status', icon: <ActivityIcon /> },

    ],
  },
]

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'System Administrator',
  EVALUATOR: 'Evaluator',
}

export default function EvaluatorLayout() {
  const { user } = useAuth()

  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#eef2f7', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 240,
        background: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Logo size="full" />
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navSections.map(section => (
            <div key={section.label} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.25)',
                padding: '4px 12px',
                marginBottom: 4,
                textTransform: 'uppercase',
              }}>
                {section.label}
              </div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                >
                  <span style={{ width: 16, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* User */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>{user?.username ?? '—'}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{ROLE_LABELS[user?.role ?? ''] ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          height: 56,
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0a1628' }}>MediAI Ghana</span>
            <span style={{ color: '#e2e8f0' }}>·</span>
            <span className="research-badge">Research Prototype</span>
          </div>
          <SignOutButton />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" /><rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" /><rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" /><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" /></svg>
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}
function ClockIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M7.5 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
}
function CpuIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="3" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><rect x="5.5" y="5.5" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.6" /><line x1="5" y1="1.5" x2="5" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><line x1="10" y1="1.5" x2="10" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><line x1="5" y1="12" x2="5" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><line x1="10" y1="12" x2="10" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
}
function MapIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 3.5l4.5-2 4 2 4.5-2V11.5l-4.5 2-4-2-4.5 2V3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><line x1="5.5" y1="1.5" x2="5.5" y2="13.5" stroke="currentColor" strokeWidth="1.2" /><line x1="9.5" y1="1.5" x2="9.5" y2="13.5" stroke="currentColor" strokeWidth="1.2" /></svg>
}
function ShieldIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L2 3.5v4c0 3 2.5 5.5 5.5 6 3-0.5 5.5-3 5.5-6v-4l-5.5-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M5 7.5l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function ActivityIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,8 4,4 7,10 10,5 14,8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
}
function BookIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 2.5A1.5 1.5 0 013.5 1h9a.5.5 0 01.5.5v12a.5.5 0 01-.5.5H3a1 1 0 01-1-1V2.5z" stroke="currentColor" strokeWidth="1.4" /><line x1="5" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><line x1="5" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><line x1="5" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
}