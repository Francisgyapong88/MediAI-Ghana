import { useState, useEffect } from 'react'
import { api, ApiError } from '../../lib/api'
import { display } from '../../lib/symptomDisplay'

interface VocabSymptom {
  id: number
  name: string
  isEnabled: boolean
}

export default function SymptomMap() {
  const [vocab, setVocab] = useState<VocabSymptom[]>([])
  const [mapVersion, setMapVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ mapVersion: string; symptoms: VocabSymptom[] }>('/symptoms')
      .then(data => {
        setVocab(data.symptoms)
        setMapVersion(data.mapVersion)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Could not load the symptom map.'))
      .finally(() => setLoading(false))
  }, [])

  const enabled = vocab.filter(s => s.isEnabled).length
  const disabled = vocab.length - enabled

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>Symptom Map</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Application terms in the active version, as held by the server.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#0d9488' }}>
              SYMPTOM_MAP {mapVersion ?? '—'}
            </div>
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>Active · Read-only</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Symptom map unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12.5, color: '#16a34a', fontWeight: 600 }}>
          {loading ? '…' : enabled} enabled
        </div>
        <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, color: '#6b7280', fontWeight: 600 }}>
          {loading ? '…' : disabled} disabled
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th>Application Term</th>
              <th>Display Label</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vocab.map(s => {
              const d = display(s.name)
              return (
                <tr key={s.id}>
                  <td><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6b7280' }}>{s.name}</span></td>
                  <td style={{ fontWeight: 600 }}>{d.label}</td>
                  <td style={{ color: '#6b7280' }}>{d.category}</td>
                  <td>
                    {s.isEnabled
                      ? <span className="tag tag-approved">● Enabled</span>
                      : <span className="tag tag-disabled">— Disabled</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>Loading symptom map…</div>}
        {!loading && !error && vocab.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>No terms in the active map.</div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
        Only enabled terms may be selected in a technical assessment, and the server rejects any other term. Source feature, transformation, rationale, author, reviewer and review date are recorded in the versioned symptom-map document; they are not stored in the application database and are therefore not shown here.
      </div>
    </div>
  )
}