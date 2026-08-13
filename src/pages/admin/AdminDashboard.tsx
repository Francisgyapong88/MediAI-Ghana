import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'

interface AdminUser {
  id: number
  username: string
  status: string
  role: { name: string } | null
}

interface AuditLogRow {
  id: number
  timestamp: string
  action: string
  resource: string | null
  resourceId: string | null
  outcome: string
  user: { username: string; role: { name: string } | null } | null
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  EVALUATOR: 'Evaluator',
  SUPERVISOR_AUDITOR: 'Supervisor',
}

const outcomeTag: Record<string, string> = {
  SUCCESS: 'tag-approved',
  DENIED: 'tag-outofscope',
  FAILURE: 'tag-insufficient',
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [mapVersion, setMapVersion] = useState<string | null>(null)
  const [modelVersion, setModelVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.allSettled([
      api.get<AdminUser[]>('/admin/users'),
      api.get<AuditLogRow[]>('/audit-logs'),
      api.get<{ mapVersion: string }>('/symptoms'),
      api.get<{ version: string }>('/model'),
    ]).then(([u, l, s, m]) => {
      if (u.status === 'fulfilled') setUsers(u.value)
      else setError(u.reason instanceof ApiError ? u.reason.message : 'Could not load users.')
      if (l.status === 'fulfilled') setLogs(l.value)
      if (s.status === 'fulfilled') setMapVersion(s.value.mapVersion)
      if (m.status === 'fulfilled') setModelVersion(m.value.version)
      setLoading(false)
    })
  }, [])

  const activeUsers = users.filter(u => u.status === 'ACTIVE').length
  const inactiveUsers = users.filter(u => u.status !== 'ACTIVE').length
  const deniedEvents = logs.filter(l => l.outcome === 'DENIED').length
  const recent = logs.slice(0, 6)

  const stats = [
    { label: 'Active Accounts', value: loading ? '…' : String(activeUsers), sub: 'Across all roles', color: '#16a34a' },
    { label: 'Suspended Accounts', value: loading ? '…' : String(inactiveUsers), sub: 'Not able to sign in', color: '#dc2626' },
    { label: 'Active Model', value: modelVersion ?? '—', sub: 'MediAI Classifier', color: '#0d9488' },
    { label: 'Active Symptom Map', value: mapVersion ?? '—', sub: 'SYMPTOM_MAP', color: '#7c3aed' },
    { label: 'Audit Events Held', value: loading ? '…' : String(logs.length), sub: 'Most recent 100', color: '#d97706' },
    { label: 'Denied Events', value: loading ? '…' : String(deniedEvents), sub: 'Within those events', color: deniedEvents > 0 ? '#dc2626' : '#6b7280' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>Administration Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>System-wide overview for administrators.</p>
      </div>

      {/* Safety banner */}
      <div className="safety-banner" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>
          Research Prototype — Not for Clinical Diagnosis
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
          Administrative access does not alter the non-diagnostic status of this prototype. All assessment outputs remain bounded technical results from synthetic data.
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Dashboard data unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="metric-card">
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0a1628', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Recent audit events */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628' }}>Recent Audit Events</div>
            <NavLink to="/admin/audit" style={{ fontSize: 12.5, color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}>View all →</NavLink>
          </div>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Account</th>
                <th>Role</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(e => {
                const roleName = e.user?.role?.name ?? ''
                return (
                  <tr key={e.id}>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#9ca3af' }}>
                        {new Date(e.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.user?.username ?? '—'}
                    </td>
                    <td>
                      {roleName
                        ? <span style={{ fontSize: 11.5, padding: '2px 7px', background: roleName === 'ADMIN' ? '#fef3c7' : '#f0f9ff', color: roleName === 'ADMIN' ? '#d97706' : '#0369a1', borderRadius: 4, fontWeight: 600 }}>{ROLE_LABELS[roleName] ?? roleName}</span>
                        : <span style={{ fontSize: 11.5, color: '#9ca3af' }}>—</span>}
                    </td>
                    <td><span className="audit-event-tag">{e.action}</span></td>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6b7280' }}>
                        {e.resource ? `${e.resource}${e.resourceId ? `:${e.resourceId}` : ''}` : '—'}
                      </span>
                    </td>
                    <td><span className={`tag ${outcomeTag[e.outcome] ?? 'tag-pending'}`} style={{ fontSize: 11 }}>{e.outcome}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {loading && <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: 14 }}>Loading…</div>}
          {!loading && recent.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: 14 }}>No audit events recorded yet.</div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Users & Roles', desc: 'Manage accounts and permissions', to: '/admin/users', color: '#0d9488' },
            { label: 'Model Versions', desc: 'Activate versioned classifier', to: '/admin/model-versions', color: '#7c3aed' },
            { label: 'Symptom Map Versions', desc: 'Manage approved symptom maps', to: '/admin/symptom-versions', color: '#1d4ed8' },
            { label: 'System Audit', desc: 'Full audit event log', to: '/admin/audit', color: '#d97706' },
          ].map(a => (
            <NavLink key={a.label} to={a.to} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = a.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628' }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{a.desc}</div>
                </div>
                <span style={{ color: a.color, fontSize: 16 }}>→</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}