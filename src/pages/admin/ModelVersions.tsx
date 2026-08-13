import { useState, useEffect } from 'react'
import { api, ApiError } from '../../lib/api'

interface ModelRow {
  id: number
  version: string
  isActive: boolean
  createdAt?: string
}

function fmt(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminModelVersions() {
  const [models, setModels] = useState<ModelRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<ModelRow[]>('/model/versions')
      .then(setModels)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Could not load model versions.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', marginBottom: 4 }}>Model Versions</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Versioned classifier records held by the server.</p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Model versions unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th>Version</th>
              <th>Created</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map(m => (
              <tr key={m.id}>
                <td><span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#0d9488' }}>{m.version}</span></td>
                <td style={{ color: '#6b7280' }}>{fmt(m.createdAt)}</td>
                <td>
                  {m.isActive
                    ? <span className="tag tag-approved">● Active</span>
                    : <span className="tag tag-disabled">— Inactive</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>Loading model versions…</div>}
        {!loading && !error && models.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>No model versions recorded.</div>
        )}
      </div>

      <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, color: '#6b7280', lineHeight: 1.6 }}>
        Version activation is not exposed through this interface in the current build. The active version is set in the database and read by the prediction endpoint; changing it requires a database operation, which is recorded in the project change record rather than performed here.
      </div>
    </div>
  )
}