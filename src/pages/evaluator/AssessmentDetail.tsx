import { useState, useEffect } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { display } from '../../lib/symptomDisplay'

interface AssessmentDetailData {
  id: number
  createdAt: string
  temperatureC: number | null
  heartRate: number | null
  respiratoryRate: number | null
  visit: { patient: { age: number; sex: string; isSynthetic: boolean } }
  assessmentSymptoms: { symptom: { name: string } }[]
  predictionSessions: {
    status: string
    createdAt: string
    model: { version: string } | null
    map: { version: string } | null
    results: { score: number; rank: number; disease: { name: string } }[]
  }[]
}

const ABSTAINED = ['INSUFFICIENT_INFORMATION', 'OUT_OF_SCOPE']

function fmt(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<AssessmentDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api
      .get<AssessmentDetailData>(`/assessments/${id}`)
      .then(setData)
      .catch(err =>
        setError(err instanceof ApiError ? err.message : 'Could not load this assessment.'),
      )
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading assessment…</div>
  }

  if (error || !data) {
    return (
      <div>
        <NavLink to="/app/history" style={{ fontSize: 13.5, color: '#6b7280', textDecoration: 'none' }}>← Back to History</NavLink>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '14px 16px', marginTop: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Assessment unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error ?? 'No record returned.'}</div>
        </div>
      </div>
    )
  }

  const session = data.predictionSessions[data.predictionSessions.length - 1]
  const top = session?.results?.[0]
  const abstained = !!session && ABSTAINED.includes(session.status)
  const displayId = `ASS-${String(data.id).padStart(4, '0')}`
  const symptoms = data.assessmentSymptoms.map(s => display(s.symptom.name).label)

  const vitals = [
    data.temperatureC !== null ? `${data.temperatureC} °C` : null,
    data.heartRate !== null ? `${data.heartRate} bpm` : null,
    data.respiratoryRate !== null ? `${data.respiratoryRate} breaths/min` : null,
  ].filter(Boolean) as string[]

  const timeline = [
    { label: 'Record Created', time: fmt(data.createdAt) },
    ...(session ? [{ label: 'Model Session Recorded', time: fmt(session.createdAt) }] : []),
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <NavLink to="/app/history" style={{ fontSize: 13.5, color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back to History
        </NavLink>
        <span style={{ color: '#d1d5db' }}>·</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#0d9488' }}>{displayId}</span>
        {session?.status === 'COMPLETED' && <span className="tag tag-completed">● Completed</span>}
        {session?.status === 'INSUFFICIENT_INFORMATION' && <span className="tag tag-insufficient">⚠ Insufficient Info</span>}
        {session?.status === 'OUT_OF_SCOPE' && <span className="tag tag-outofscope">✕ Out of Scope</span>}
        {!session && <span className="tag tag-pending">No session</span>}
      </div>

      <div className="detail-grid" style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Overview */}
          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', marginBottom: 16 }}>Assessment Overview</div>
            <div className="overview-grid" style={{ display: 'grid', gap: 12 }}>
              {[
                { label: 'Assessment ID', value: displayId, mono: true },
                { label: 'Record Type', value: data.visit.patient.isSynthetic ? 'Synthetic Demo Record' : 'Non-synthetic', mono: false },
                { label: 'Date', value: fmt(data.createdAt), mono: false },
                { label: 'Synthetic Age / Sex', value: `${data.visit.patient.age} · ${data.visit.patient.sex}`, mono: false },
                { label: 'Model Version', value: session?.model?.version ?? '—', mono: true },
                { label: 'Symptom Map', value: session?.map?.version ?? '—', mono: true },
              ].map(m => (
                <div key={m.label} style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{m.label}</div>
                  <div style={{ fontFamily: m.mono ? "'JetBrains Mono', monospace" : 'inherit', fontSize: m.mono ? 11.5 : 13, fontWeight: 600, color: '#374151' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>Selected Symptoms ({symptoms.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {symptoms.map(s => (
                <span key={s} style={{ padding: '5px 12px', background: '#f0fdf9', border: '1px solid #0d9488', borderRadius: 20, fontSize: 13, color: '#0d9488', fontWeight: 600 }}>{s}</span>
              ))}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginTop: 20, marginBottom: 4 }}>Recorded Vital Signs</div>
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 10 }}>Stored with the record. Not used by the classifier in the current scope.</div>
            {vitals.length === 0 ? (
              <div style={{ fontSize: 13, color: '#9ca3af' }}>None recorded.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {vitals.map(v => (
                  <span key={v} style={{ padding: '5px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{v}</span>
                ))}
              </div>
            )}
          </div>

          {/* Model Output */}
          {session && !abstained && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #0a1628, #0f2040)', border: '1px solid rgba(13,148,136,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Model Output</div>
                <span className="not-diagnosis-badge">Not a Diagnosis</span>
              </div>
              <div style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: 10 }}>
                {top ? titleCase(top.disease.name) : '—'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Model Score</div>
              <div className="score-display">{top ? top.score.toFixed(2) : '—'}</div>
            </div>
          )}

          {session && abstained && (
            <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#334155', marginBottom: 8 }}>
                {session.status === 'OUT_OF_SCOPE' ? 'Out of Scope' : 'Insufficient Information'}
              </div>
              <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>
                No label was reported for this record. The system withheld a result rather than forcing one. This is a normal bounded outcome, not an error, and does not indicate the absence of any condition.
              </div>
            </div>
          )}

          {!session && (
            <div className="card" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>No Model Session</div>
              <div style={{ fontSize: 13, color: '#a16207', lineHeight: 1.6 }}>
                This record was created but no inference session has been recorded against it.
              </div>
            </div>
          )}
        </div>

        {/* Right — Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628', marginBottom: 16 }}>Assessment Timeline</div>
            {timeline.map((t, i) => (
              <div key={t.label} style={{ display: 'flex', gap: 12, paddingBottom: i < timeline.length - 1 ? 16 : 0, position: 'relative' }}>
                {i < timeline.length - 1 && (
                  <div style={{ position: 'absolute', left: 11, top: 26, width: 2, height: '100%', background: '#e2e8f0' }} />
                )}
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700, flexShrink: 0, zIndex: 1 }}>✓</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0a1628' }}>{t.label}</div>
                  <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>{t.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628', marginBottom: 10 }}>Audit Information</div>
            <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6 }}>
              Audit events for this record are written server-side and are readable through the administrator audit view. They are not exposed to this screen.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .detail-grid {
          grid-template-columns: 1fr 300px;
        }
        .overview-grid {
          grid-template-columns: 1fr 1fr 1fr;
        }

        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .overview-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 420px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}