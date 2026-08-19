import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

interface Probe {
  name: string
  detail: string
  ms: number | null
  ok: boolean | null
}

async function timed(fn: () => Promise<unknown>): Promise<{ ms: number; ok: boolean }> {
  const t0 = performance.now()
  try {
    await fn()
    return { ms: Math.round(performance.now() - t0), ok: true }
  } catch {
    return { ms: Math.round(performance.now() - t0), ok: false }
  }
}

export default function SystemStatus() {
  const [probes, setProbes] = useState<Probe[]>([
    { name: 'API server', detail: 'GET /api/health', ms: null, ok: null },
    { name: 'API + database', detail: 'GET /api/symptoms', ms: null, ok: null },
    { name: 'Session', detail: 'GET /api/auth/me', ms: null, ok: null },
  ])
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    const health = await timed(() => api.get('/health'))
    const symptoms = await timed(() => api.get('/symptoms'))
    const session = await timed(() => api.get('/auth/me'))
    setProbes([
      { name: 'API server', detail: 'GET /api/health', ...health },
      { name: 'API + database', detail: 'GET /api/symptoms', ...symptoms },
      { name: 'Session', detail: 'GET /api/auth/me', ...session },
    ])
    setCheckedAt(new Date())
    setRunning(false)
  }

  useEffect(() => {
    run()
  }, [])

  const allOk = probes.every(p => p.ok === true)
  const anyFailed = probes.some(p => p.ok === false)

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>System Status</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Reachability probes issued from this browser session. Not a server-side monitoring system.</p>
      </div>

      <div className="status-bar" style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', flexWrap: 'wrap',
        background: anyFailed ? '#fef2f2' : allOk ? '#f0fdf4' : '#f8fafc',
        border: `1px solid ${anyFailed ? '#fecaca' : allOk ? '#bbf7d0' : '#e2e8f0'}`,
        borderRadius: 10, marginBottom: 20,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: anyFailed ? '#dc2626' : allOk ? '#16a34a' : '#9ca3af', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: anyFailed ? '#b91c1c' : allOk ? '#15803d' : '#6b7280' }}>
          {anyFailed ? 'One or more probes failed' : allOk ? 'All probes reachable' : 'Running probes…'}
        </span>
        <span className="status-time" style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
          {checkedAt ? `Last checked: ${checkedAt.toLocaleString('en-GB')}` : '—'}
        </span>
        <button
          onClick={run}
          disabled={running}
          style={{ fontSize: 12, padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white', cursor: running ? 'default' : 'pointer', color: '#374151', fontWeight: 600 }}
        >
          {running ? 'Checking…' : 'Re-check'}
        </button>
      </div>

      <div className="probe-grid" style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        {probes.map(p => (
          <div key={p.name} className="metric-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.ok === null ? '#9ca3af' : p.ok ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
                <span style={{ fontSize: 12.5, color: p.ok === null ? '#9ca3af' : p.ok ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {p.ok === null ? 'Checking' : p.ok ? 'Reachable' : 'Failed'}
                </span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9ca3af' }}>{p.detail}</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#0d9488', fontWeight: 600 }}>
              {p.ms === null ? '—' : `${p.ms}ms`}
            </div>
          </div>
        ))}
      </div>

      <div className="info-grid" style={{ display: 'grid', gap: 20 }}>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Measurement Scope</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>What these numbers do and do not represent.</div>
          {[
            { label: 'What is measured', value: 'Browser round-trip time' },
            { label: 'Includes', value: 'Network, Express, Prisma, MariaDB' },
            { label: 'Excludes', value: 'Server-side timing breakdown' },
            { label: 'Sample size', value: 'One request per probe' },
            { label: 'Environment', value: 'Local development only' },
          ].map(m => (
            <div key={m.label} className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
              <span style={{ fontSize: 13.5, color: '#374151', flexShrink: 0 }}>{m.label}</span>
              <span style={{ fontSize: 12.5, color: '#6b7280', textAlign: 'right' }}>{m.value}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Failure Behaviour Cases</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Defined expectations. Results are recorded in the project test record, not here.</div>
          {[
            { scenario: 'Database unavailable', behaviour: 'No fabricated result is shown' },
            { scenario: 'Model unavailable', behaviour: 'Assessment fails without a label' },
            { scenario: 'Network interruption', behaviour: 'Explicit error, no silent retry' },
            { scenario: 'Session expiry', behaviour: 'Redirect to sign-in with a reason' },
          ].map(f => (
            <div key={f.scenario} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>{f.scenario}</span>
                <span className="tag tag-pending" style={{ flexShrink: 0 }}>Not recorded here</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#6b7280' }}>{f.behaviour}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .probe-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .info-grid {
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 900px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .probe-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .probe-grid {
            grid-template-columns: 1fr;
          }
          .status-bar {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .status-time {
            margin-left: 0 !important;
          }
          .status-bar button {
            width: 100%;
          }
          .kv-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 4px !important;
          }
          .kv-row span:last-child {
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  )
}