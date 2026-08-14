import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import WelcomeBanner from '../../components/WelcomeBanner'

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

function statusTag(status: string) {
  if (status === 'Completed') return <span className="tag tag-completed">Completed</span>
  if (status === 'Insufficient Information') return <span className="tag tag-insufficient">Insufficient Info</span>
  if (status === 'Out of Scope') return <span className="tag tag-outofscope">Out of Scope</span>
  return <span className="tag tag-pending">{status}</span>
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

export default function EvaluatorDashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [mapVersion, setMapVersion] = useState<string | null>(null)
  const [apiUp, setApiUp] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.allSettled([
      api.get<Assessment[]>('/assessments'),
      api.get<{ mapVersion: string }>('/symptoms'),
    ]).then(([a, s]) => {
      if (a.status === 'fulfilled') {
        setAssessments(a.value)
        setApiUp(true)
      } else {
        setApiUp(false)
        setError(a.reason instanceof ApiError ? a.reason.message : 'Could not reach the server.')
      }
      if (s.status === 'fulfilled') setMapVersion(s.value.mapVersion)
      setLoading(false)
    })
  }, [])

  const rows = assessments.slice(0, 5).map(a => {
    const session = a.predictionSessions[a.predictionSessions.length - 1]
    const top = session?.results?.[0]
    return {
      id: a.id,
      label: `ASS-${String(a.id).padStart(4, '0')}`,
      date: new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      output: top ? titleCase(top.disease.name) : '-',
      score: top ? top.score.toFixed(2) : '-',
      version: session?.model?.version ?? '-',
      status: STATUS_LABELS[session?.status ?? ''] ?? 'No session',
    }
  })

  const activeModelVersion = assessments
    .flatMap(a => a.predictionSessions)
    .find(s => s.model?.version)?.model?.version ?? null

  return (
    <div>
      <WelcomeBanner />
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Overview of your assessment activity and system status.</p>
      </div>

      {/* Safety Banner */}
      <div className="safety-banner" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 3, minHeight: 40, background: '#dc2626', borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>
            Research Prototype - Not for Clinical Diagnosis
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
            Technical model outputs are generated from synthetic demonstration records and must not replace professional clinical judgement. This system is a bounded academic prototype.
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Dashboard data unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Your Assessments', value: loading ? '...' : String(assessments.length), sub: 'Synthetic records', color: '#0d9488' },
          { label: 'Supported Conditions', value: '4', sub: 'Model labels', color: '#1d4ed8' },
          { label: 'Model Version', value: activeModelVersion ?? '-', sub: 'MediAI Classifier', color: '#0d9488' },
          { label: 'Symptom Map', value: mapVersion ?? '-', sub: 'SYMPTOM_MAP', color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="metric-card">
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0a1628', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* New assessment CTA */}
          <div style={{ background: 'linear-gradient(135deg, #0a1628, #0f2040)', border: '1px solid rgba(13,148,136,0.25)', borderRadius: 12, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 6 }}>Start a New Assessment</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', maxWidth: 360 }}>
                Create a synthetic demonstration record and run a bounded technical model assessment.
              </div>
            </div>
            <NavLink to="/app/new-assessment">
              <button className="btn-primary" style={{ padding: '12px 22px', fontSize: 14, flexShrink: 0 }}>
                Begin Assessment
              </button>
            </NavLink>
          </div>

          {/* Recent Assessments */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628' }}>Recent Assessments</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Using terminology: Model Output - Model Score - Synthetic Records</div>
              </div>
              <NavLink to="/app/history" style={{ fontSize: 12.5, color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}>View all</NavLink>
            </div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Assessment ID</th>
                  <th>Created</th>
                  <th>Model Output</th>
                  <th>Model Score</th>
                  <th>Model Version</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td>
                      <NavLink to={`/app/history/${row.id}`} style={{ textDecoration: 'none', color: '#0d9488', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5 }}>
                        {row.label}
                      </NavLink>
                    </td>
                    <td style={{ color: '#6b7280' }}>{row.date}</td>
                    <td style={{ fontWeight: 600 }}>{row.output}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: row.score !== '-' ? '#0d9488' : '#9ca3af' }}>{row.score}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6b7280' }}>{row.version}</td>
                    <td>{statusTag(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: 14 }}>Loading...</div>}
            {!loading && rows.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: 14 }}>No assessments recorded yet.</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Service reachability */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Service Reachability</div>
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 12 }}>Observed from this browser session only.</div>
            {[
              { label: 'Frontend', up: true },
              { label: 'API server', up: apiUp },
              { label: 'Session', up: apiUp },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{s.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: s.up === null ? '#9ca3af' : s.up ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.up === null ? '#9ca3af' : s.up ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
                  {s.up === null ? 'Checking' : s.up ? 'Reachable' : 'Unreachable'}
                </span>
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 10, lineHeight: 1.5 }}>
              Database and model health are not separately probed in this prototype.
            </div>
          </div>

          {/* Model Info */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Active Model</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0a1628', marginBottom: 4 }}>MediAI Classifier</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#0d9488', marginBottom: 12 }}>
              {activeModelVersion ? `${activeModelVersion} - TensorFlow.js` : 'TensorFlow.js'}
            </div>
            <div style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>
              Server-side inference - 4-label demonstration model
            </div>
            <NavLink to="/app/model" style={{ fontSize: 12.5, color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}>
              View Model Information
            </NavLink>
          </div>

          {/* 4-label scope reminder */}
          <div className="card" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>4-Label Demonstration Model</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Malaria', 'Typhoid Fever', 'Pneumonia', 'Diabetes Mellitus'].map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>{c}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: '#d97706', marginTop: 10, paddingTop: 10, borderTop: '1px solid #fed7aa' }}>
              Other conditions are outside the active model scope.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}