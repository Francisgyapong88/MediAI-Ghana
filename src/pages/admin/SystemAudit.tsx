import { useState, useEffect } from 'react'
import { api, ApiError } from '../../lib/api'

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

const outcomeColor: Record<string, string> = {
  SUCCESS: '#16a34a',
  DENIED: '#dc2626',
  FAILURE: '#d97706',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function SystemAudit() {
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api
      .get<AuditLogRow[]>('/audit-logs')
      .then(setLogs)
      .catch(err =>
        setError(err instanceof ApiError ? err.message : 'Could not load the audit log.'),
      )
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l => {
    if (!filter) return true
    const q = filter.toLowerCase()
    return (
      l.action.toLowerCase().includes(q) ||
      (l.user?.username ?? '').toLowerCase().includes(q) ||
      (l.resource ?? '').toLowerCase().includes(q)
    )
  })

  const deniedCount = logs.filter(l => l.outcome === 'DENIED').length

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>System Audit</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Append-only log of system events. Passwords, tokens, and secrets are never recorded.</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Audit log unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      <div className="audit-controls" style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12.5, color: '#16a34a', fontWeight: 600 }}>
          {logs.length} most recent events
        </div>
        {deniedCount > 0 && (
          <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 12.5, color: '#d97706', fontWeight: 600 }}>
            {deniedCount} denied {deniedCount === 1 ? 'event' : 'events'}
          </div>
        )}
        <div className="audit-search" style={{ marginLeft: 'auto' }}>
          <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by account, action…" style={{ width: 240 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>Timestamp</th>
                <th>Account</th>
                <th>Role</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9ca3af' }}>{fmt(e.timestamp)}</span></td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#374151' }}>{e.user?.username ?? '—'}</td>
                  <td>
                    {e.user?.role
                      ? <span style={{ fontSize: 11, padding: '2px 6px', background: '#f1f5f9', color: '#475569', borderRadius: 3, fontWeight: 600 }}>{ROLE_LABELS[e.user.role.name] ?? e.user.role.name}</span>
                      : <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>}
                  </td>
                  <td><span className="audit-event-tag">{e.action}</span></td>
                  <td>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#6b7280' }}>
                      {e.resource ? `${e.resource}${e.resourceId ? `:${e.resourceId}` : ''}` : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 700, color: outcomeColor[e.outcome] ?? '#6b7280' }}>
                      {e.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>Loading audit log…</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>
            {logs.length === 0 ? 'No audit events recorded yet.' : 'No events match that filter.'}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
        Showing {filtered.length} of {logs.length} · most recent 100 events
      </div>

      <style>{`
        .table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .data-table {
          min-width: 640px;
        }

        @media (max-width: 640px) {
          .audit-search {
            margin-left: 0 !important;
            width: 100%;
          }
          .audit-search input {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}