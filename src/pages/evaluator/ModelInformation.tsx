import { useState, useEffect } from 'react'
import { api, ApiError } from '../../lib/api'

interface ActiveModel {
  version: string
  createdAt?: string
}

const pipeline = [
  'Source dataset',
  'Dataset freeze',
  'Preprocessing',
  'Duplicate audit',
  'Grouped partitioning',
  'Training',
  'Validation',
  'Frozen test',
  'TensorFlow.js export',
  'Server deployment',
]

export default function ModelInformation() {
  const [model, setModel] = useState<ActiveModel | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<ActiveModel>('/model')
      .then(setModel)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Could not load model metadata.'))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>Model Information</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Technical details about the active machine-learning classifier.</p>
      </div>

      {/* Warning */}
      <div style={{ padding: '14px 18px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, marginBottom: 20, display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
        <div style={{ fontSize: 13.5, color: '#92400e', lineHeight: 1.55 }}>
          <strong>Technical Evaluation — Not Clinical Validation.</strong> Technical performance metrics do not establish clinical validity. This model has not been clinically validated and is not suitable for clinical use.
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Model metadata unavailable</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      {/* Model cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Model Name', value: 'MediAI Four-Class Classifier', mono: false },
          { label: 'Intended Runtime', value: 'TensorFlow.js', mono: true },
          { label: 'Inference Location', value: 'Server-side', mono: false },
          { label: 'Active Version', value: model?.version ?? '—', mono: true },
          { label: 'Number of Labels', value: '4', mono: false },
          { label: 'Dataset', value: 'Externally sourced demonstration data', mono: false },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: m.mono ? "'JetBrains Mono', monospace" : 'inherit', fontSize: m.mono ? 18 : 15, fontWeight: 800, color: '#0a1628' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pipeline */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Model Training Pipeline</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Documented process. Stage completion is recorded in the project record, not detected by this screen.</div>
          {pipeline.map((step, i) => (
            <div key={step}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f8fafc', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: '#374151' }}>{step}</span>
              </div>
              {i < pipeline.length - 1 && <div style={{ width: 2, height: 12, background: '#e2e8f0', marginLeft: 13 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Labels */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>Four-Label Demonstration Model</div>
            {[
              { label: 'Malaria', code: 'MLR', idx: 0 },
              { label: 'Typhoid Fever', code: 'TYP', idx: 1 },
              { label: 'Pneumonia', code: 'PNE', idx: 2 },
              { label: 'Diabetes Mellitus', code: 'DIA', idx: 3 },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: 'white', background: '#0d9488', padding: '2px 6px', borderRadius: 4 }}>Label {c.idx}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0a1628' }}>{c.label}</div>
                <div style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: '#9ca3af' }}>{c.code}</div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: '#d97706', marginTop: 8, fontWeight: 600 }}>
              Other conditions are outside the active model scope.
            </div>
          </div>

          {/* Server-side notice */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #0a1628, #0f2040)', border: '1px solid rgba(13,148,136,0.3)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Server-Side Inference</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              Inference is performed exclusively on the server. Model weights are never sent to the browser, and the client receives only the bounded output and its version metadata.
            </div>
          </div>

          {/* Build status */}
          <div className="card" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#d97706', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Current Build Status</div>
            <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6 }}>
              The trained classifier is not yet connected in this build. The prediction endpoint returns a fixed placeholder output, so any score shown by this prototype does not reflect model behaviour.
            </div>
          </div>

          {/* Clinical disclaimer */}
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Non-Clinical Research Tool</div>
            <div style={{ fontSize: 12.5, color: '#991b1b', lineHeight: 1.6 }}>
              Technical performance metrics (accuracy, precision, recall, F1) are evaluation measures for the machine-learning system only. They do not constitute clinical validation, diagnostic accuracy claims, or evidence of clinical effectiveness.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}