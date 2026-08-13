import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

interface Assessment {
  id: number
  createdAt: string
  predictionSessions: {
    status: string
    model: { version: string } | null
    results: { score: number; rank: number; disease: { name: string } }[]
  }[]
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  INSUFFICIENT_INFORMATION: 'Insufficient Information',
  OUT_OF_SCOPE: 'Out of Scope',
  FAILED: 'Failed',
  PENDING: 'Pending',
  UNKNOWN: 'Unknown',
}

type FilterType = 'All' | 'Completed' | 'Insufficient Information' | 'Out of Scope'

function statusTag(status: string) {
  if (status === 'Completed') return <span className="tag tag-completed">● Completed</span>
  if (status === 'Insufficient Information') return <span className="tag tag-insufficient">⚠ Insufficient Info</span>
  if (status === 'Out of Scope') return <span className="tag tag-outofscope">✕ Out of Scope</span>
  return <span className="tag tag-pending">{status}</span>
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

export default function AssessmentHistory() {
  const [filter, setFilter] = useState<FilterType>('All')
  const [search, setSearch] = useState('')
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const readOnly = user?.role === 'SUPERVISOR_AUDITOR'

  useEffect(() => {
    api
      .get<Assessment[]>('/assessments')
      .then(setAssessments)
      .catch(err =>
        setError(err instanceof ApiError ? err.message : 'Could not load assessment history.'),
      )
      .finally(() => setLoading(false))
  }, [])

  // Flatten each assessment to its latest prediction session for the table.
  const rows = assessments.map(a => {
    const session = a.predictionSessions[a.predictionSessions.length - 1]
    const top = session?.results?.[0]
    return {
      key: a.id,
      id: `ASS-${String(a.id).padStart(4, '0')}`,
      date: new Date(a.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      output: top ? titleCase(top.disease.name) : '—',
      score: top ? top.score.toFixed(2) : '—',
      version: session?.model?.version ?? '—',
      status: STATUS_LABELS[session?.status ?? ''] ?? 'No session',
    }
  })

  const filtered = rows.filter(a => {
    const matchesFilter = filter === 'All' || a.status === filter
    const matchesSearch = !search || a.id.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const filterCounts = {
    All: rows.length,
    Completed: rows.filter(a => a.status === 'Completed').length,
    'Insufficient Information': rows.filter(a => a.status === 'Insufficient Information').length,
    'Out of Scope': rows.filter(a => a.status === 'Out of Scope').length,
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>Assessment History</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Technical assessment records for synthetic demonstration data.</p>
        </div>
        {!readOnly && (
          <NavLink to="/app/new-assessment">
            <button className="btn-primary">+ New Assessment</button>
          </NavLink>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>History unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['All', 'Completed', 'Insufficient Information', 'Out of Scope'] as FilterType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: 6, border: `1px solid ${filter === f ? '#0d9488' : '#e2e8f0'}`,
                background: filter === f ? '#f0fdf9' : 'white',
                color: filter === f ? '#0d9488' : '#6b7280',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              }}>
                {f} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({filterCounts[f]})</span>
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', minWidth: 220 }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Assessment ID…" style={{ padding: '8px 12px', fontSize: 13 }} />
          </div>
        </div>
      </div>

      {/* Terminology note */}
      <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 12, padding: '0 4px' }}>
        Columns use technical terminology: <strong>Model Output</strong> (not "Diagnosis") · <strong>Model Score</strong> (not "Confidence" or "Probability") · <strong>Synthetic Records</strong> only
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th>Assessment ID</th>
              <th>Date</th>
              <th>Model Output</th>
              <th>Model Score</th>
              <th>Model Version</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.key}>
                <td>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: '#0d9488' }}>{row.id}</span>
                </td>
                <td style={{ color: '#6b7280' }}>{row.date}</td>
                <td style={{ fontWeight: 600 }}>{row.output}</td>
                <td>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: row.score !== '—' ? '#0d9488' : '#9ca3af' }}>{row.score}</span>
                </td>
                <td>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6b7280' }}>{row.version}</span>
                </td>
                <td>{statusTag(row.status)}</td>
                <td>
                  <NavLink to={`/app/history/${row.key}`} style={{ fontSize: 12.5, color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}>
                    View →
                  </NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>
            Loading assessment history…
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>
            {rows.length === 0 ? 'No assessments recorded yet.' : 'No assessments found matching your criteria.'}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
        Showing {filtered.length} of {rows.length} assessments
      </div>
    </div>
  )
}