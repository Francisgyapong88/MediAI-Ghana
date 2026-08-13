import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { display } from '../../lib/symptomDisplay'

const steps = ['Synthetic Record', 'Symptoms', 'Review', 'Processing', 'Result']

const AGE_GROUPS: Record<string, number> = {
  'Paediatric (0–12)': 8,
  'Adolescent (13–17)': 15,
  'Adult (18–59)': 34,
  'Older Adult (60+)': 67,
}

const SEX_MAP: Record<string, string> = {
  Male: 'MALE',
  Female: 'FEMALE',
  'Not specified': 'OTHER',
}

interface VocabSymptom {
  id: number
  name: string
  isEnabled: boolean
}

interface PredictionResponse {
  status: string
  modelVersion: string
  symptomMapVersion: string
  reason?: string
  results: { label: string; score: number; rank: number }[]
}

// Abstention is a normal bounded outcome, not an error (FR-05).
const ABSTAINED = ['INSUFFICIENT_INFORMATION', 'OUT_OF_SCOPE']

const processingSteps = [
  { label: 'Input validated', done: true },
  { label: 'Authorisation verified', done: true },
  { label: 'Symptom mapping checked', done: true },
  { label: 'Server-side model loaded', done: true },
  { label: 'Running inference', active: true },
  { label: 'Generating bounded output', pending: true },
  { label: 'Recording audit event', pending: true },
]

export default function NewAssessment() {
  const [step, setStep] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ageGroup, setAgeGroup] = useState('')
  const [sex, setSex] = useState('')
  const [temperatureC, setTemperatureC] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [serverId, setServerId] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [vocab, setVocab] = useState<VocabSymptom[]>([])
  const [mapVersion, setMapVersion] = useState('')
  const [vocabError, setVocabError] = useState<string | null>(null)
  const [vocabLoading, setVocabLoading] = useState(true)
  const [bpAttempt, setBpAttempt] = useState<{ ok: boolean; message: string } | null>(null)
  const [bpPending, setBpPending] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get<{ mapVersion: string; symptoms: VocabSymptom[] }>('/symptoms')
      .then(data => {
        setVocab(data.symptoms)
        setMapVersion(data.mapVersion)
      })
      .catch(err =>
        setVocabError(
          err instanceof ApiError ? err.message : 'Could not load the symptom vocabulary.',
        ),
      )
      .finally(() => setVocabLoading(false))
  }, [])

  const supportedSymptoms = vocab
    .filter(s => s.isEnabled)
    .map(s => ({ id: s.name, ...display(s.name) }))

  const disabledSymptoms = vocab.filter(s => !s.isEnabled).map(s => display(s.name).label)

  const categories = Array.from(new Set(supportedSymptoms.map(s => s.category)))

  const abstained = !!result && ABSTAINED.includes(result.status)

  const assessmentId = serverId ? `ASS-${String(serverId).padStart(4, '0')}` : 'Pending'
  const recordId = serverId ? `REC-SYN-2026-${String(serverId).padStart(4, '0')}` : 'Pending'

  const resetForm = () => {
    setStep(0)
    setSelectedSymptoms([])
    setConfirmed(false)
    setResult(null)
    setServerId(null)
    setAgeGroup('')
    setSex('')
    setTemperatureC('')
    setHeartRate('')
    setRespiratoryRate('')
    setBpAttempt(null)
  }

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const filteredSymptoms = supportedSymptoms.filter(s => {
    const matchesSearch = s.label.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleProcessing = async () => {
    setStep(3)
    setIsProcessing(true)
    setSubmitError(null)
    try {
      // Blank vitals are omitted rather than sent as 0 — an unrecorded
      // measurement must not be persisted as a measured value.
      const assessment = await api.post<{ id: number }>('/assessments', {
        age: AGE_GROUPS[ageGroup],
        sex: SEX_MAP[sex],
        symptoms: selectedSymptoms,
        ...(temperatureC !== '' && { temperatureC: Number(temperatureC) }),
        ...(heartRate !== '' && { heartRate: Number(heartRate) }),
        ...(respiratoryRate !== '' && { respiratoryRate: Number(respiratoryRate) }),
      })
      const prediction = await api.post<PredictionResponse>('/predict', {
        assessmentId: assessment.id,
      })
      setServerId(assessment.id)
      setResult(prediction)
      setIsProcessing(false)
      setStep(4)
    } catch (err) {
      setIsProcessing(false)
      setSubmitError(err instanceof ApiError ? err.message : 'Could not reach the server.')
      setStep(2)
    }
  }

  // Deliberate bypass attempt against the permanently disabled feature gate
  // (FR-11 / §3.11.1). A refusal is the expected, correct outcome; a success
  // would mean the boundary has failed and must be reported.
  const attemptBloodPressure = async () => {
    setBpPending(true)
    setBpAttempt(null)
    try {
      await api.post('/blood-pressure', { systolic: 140, diastolic: 90 })
      setBpAttempt({ ok: true, message: 'The disabled feature returned a response. This is a boundary failure and must be reported.' })
    } catch (err) {
      setBpAttempt({
        ok: false,
        message: err instanceof ApiError ? err.message : 'Request refused by the server.',
      })
    } finally {
      setBpPending(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>New Assessment</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Bounded technical model assessment using a synthetic demonstration record.</p>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: i < step ? 'pointer' : 'default' }} onClick={() => { if (i < step) setStep(i) }}>
                <div className={`step-circle ${i < step ? 'step-done' : i === step ? 'step-active' : 'step-pending'}`} style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: i < step ? '#16a34a' : i === step ? '#0d9488' : '#e2e8f0',
                  color: i < step || i === step ? 'white' : '#9ca3af',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: i === step ? 700 : 500, color: i < step ? '#16a34a' : i === step ? '#0a1628' : '#9ca3af', whiteSpace: 'nowrap' }}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? '#16a34a' : '#e2e8f0', margin: '0 12px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0 — Synthetic Record */}
      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24, padding: '14px 16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Synthetic Records Only</div>
                <div style={{ fontSize: 13, color: '#a16207', lineHeight: 1.5 }}>This prototype does not accept real or de-identified patient records. All data entered must be synthetic and for demonstration purposes only.</div>
              </div>
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0a1628', marginBottom: 20 }}>Create Synthetic Demonstration Record</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assessment ID</label>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: '#0d9488', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>{assessmentId}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Assigned by server on submission</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Technical Record ID</label>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: '#0d9488', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>{recordId}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Assigned by server on submission</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Synthetic Age Group</label>
                <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
                  <option value="" disabled>Select age group</option>
                  <option>Paediatric (0–12)</option>
                  <option>Adolescent (13–17)</option>
                  <option>Adult (18–59)</option>
                  <option>Older Adult (60+)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Synthetic Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)}>
                  <option value="" disabled>Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Not specified</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Symptom Duration (Synthetic)</label>
                <select defaultValue="">
                  <option value="" disabled>Select duration</option>
                  <option>Less than 1 day</option>
                  <option>1–3 days</option>
                  <option>4–7 days</option>
                  <option>1–2 weeks</option>
                  <option>More than 2 weeks</option>
                </select>
              </div>

              <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Selected Vital Signs (Synthetic, Optional)</div>
                <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 10 }}>Recorded with the assessment. Not used by the classifier in the current scope.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Temperature (°C)</label>
                    <input type="number" step="0.1" min="30" max="45" value={temperatureC} onChange={e => setTemperatureC(e.target.value)} placeholder="e.g. 38.4" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Heart Rate (bpm)</label>
                    <input type="number" min="20" max="250" value={heartRate} onChange={e => setHeartRate(e.target.value)} placeholder="e.g. 92" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Respiratory Rate</label>
                    <input type="number" min="5" max="80" value={respiratoryRate} onChange={e => setRespiratoryRate(e.target.value)} placeholder="e.g. 20" />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="checkbox-custom" style={{ marginTop: 2 }} />
                <span style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>
                  <strong>I confirm that this is a synthetic demonstration record.</strong> The data entered is artificial and does not represent any real individual. No real patient data has been used.
                </span>
              </label>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" disabled={!confirmed || !ageGroup || !sex} style={{ opacity: confirmed && ageGroup && sex ? 1 : 0.4 }} onClick={() => setStep(1)}>
                Continue to Symptoms →
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Assessment Workflow</div>
              <div style={{ fontSize: 13, color: '#0c4a6e', lineHeight: 1.6 }}>
                1. Create a synthetic record<br />
                2. Select applicable symptoms<br />
                3. Review before submission<br />
                4. Technical model assessment<br />
                5. View bounded technical result
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Active Model</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628' }}>MediAI Classifier</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6b7280' }}>TensorFlow.js</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Server-side inference · 4-label scope</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Symptoms */}
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              {vocabLoading && (
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Loading symptom vocabulary…</div>
              )}
              {vocabError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Vocabulary unavailable</div>
                  <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{vocabError}</div>
                </div>
              )}

              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Select Supported Symptoms</h3>
              <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 16 }}>Select all symptoms applicable to the synthetic demonstration record.</p>

              {/* Search + category filter */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search symptoms…" style={{ flex: 1, minWidth: 180 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setActiveCategory(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, background: !activeCategory ? '#0a1628' : 'white', color: !activeCategory ? 'white' : '#374151', cursor: 'pointer' }}>
                    All
                  </button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, background: activeCategory === cat ? '#0d9488' : 'white', color: activeCategory === cat ? 'white' : '#374151', cursor: 'pointer' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom grid */}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Supported Application Symptoms</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {filteredSymptoms.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${selectedSymptoms.includes(s.id) ? '#0d9488' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', background: selectedSymptoms.includes(s.id) ? '#f0fdf9' : 'white', transition: 'all 0.15s' }}>
                    <input type="checkbox" className="checkbox-custom" checked={selectedSymptoms.includes(s.id)} onChange={() => toggleSymptom(s.id)} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0a1628' }}>{s.label}</div>
                      <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 500 }}>{s.category}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Disabled symptoms */}
              <div style={{ marginTop: 24, padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Disabled / Unsupported Features</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {disabledSymptoms.map(s => (
                    <div key={s} style={{ padding: '5px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12.5, color: '#9ca3af', textDecoration: 'line-through' }}>{s}</div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
                  These features are currently unavailable because the active symptom map does not contain approved model evidence for them.
                </div>
              </div>

              {/* Disabled BP feature */}
              <div style={{ marginTop: 14, padding: '14px', background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 15 }}>🔒</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>Blood-Pressure Classification</div>
                    <span style={{ fontSize: 10.5, background: '#f1f5f9', color: '#6b7280', padding: '1px 6px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Disabled</span>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: '#9ca3af', lineHeight: 1.5, marginBottom: 12 }}>
                  This feature is outside the active functional scope and cannot be used without qualified clinical approval, a versioned specification and safety testing.
                </div>

                <button
                  onClick={attemptBloodPressure}
                  disabled={bpPending}
                  style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: bpPending ? 'default' : 'pointer' }}
                >
                  {bpPending ? 'Attempting…' : 'Attempt to use this feature'}
                </button>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                  Sends a real request to the disabled endpoint. The attempt is recorded in the audit log.
                </div>

                {bpAttempt && (
                  <div style={{
                    marginTop: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: bpAttempt.ok ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${bpAttempt.ok ? '#fecaca' : '#cbd5e1'}`,
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: bpAttempt.ok ? '#dc2626' : '#334155', marginBottom: 2 }}>
                      {bpAttempt.ok ? '⚠ Boundary failure' : 'Request refused by the server'}
                    </div>
                    <div style={{ fontSize: 12, color: bpAttempt.ok ? '#b91c1c' : '#475569', lineHeight: 1.5 }}>{bpAttempt.message}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(0)}>← Back</button>
              <button className="btn-primary" disabled={selectedSymptoms.length === 0} style={{ opacity: selectedSymptoms.length > 0 ? 1 : 0.4 }} onClick={() => setStep(2)}>
                Review Assessment →
              </button>
            </div>
          </div>

          {/* Selected panel */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>Selected Symptoms</div>
            {selectedSymptoms.length === 0 ? (
              <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No symptoms selected</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedSymptoms.map(id => {
                  const s = supportedSymptoms.find(x => x.id === id) ?? display(id)
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#f0fdf9', border: '1px solid #0d9488', borderRadius: 20, fontSize: 12.5, color: '#0d9488', fontWeight: 600 }}>
                      {s.label}
                      <button onClick={() => toggleSymptom(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ marginTop: 16, padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Validation Status</div>
              {selectedSymptoms.length === 0 && <div style={{ fontSize: 12.5, color: '#d97706', fontWeight: 600 }}>⚠ Missing Information — Select at least one symptom</div>}
              {selectedSymptoms.length >= 1 && selectedSymptoms.length < 3 && <div style={{ fontSize: 12.5, color: '#d97706', fontWeight: 600 }}>⚠ Limited data — the server may withhold a result</div>}
              {selectedSymptoms.length >= 3 && <div style={{ fontSize: 12.5, color: '#16a34a', fontWeight: 600 }}>✓ Ready for review</div>}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0a1628', marginBottom: 20 }}>Review Assessment</h3>

              {submitError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Submission failed</div>
                  <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{submitError}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Assessment ID</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: '#0d9488' }}>{assessmentId}</div>
                </div>
                <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Record Type</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0a1628' }}>Synthetic Demonstration Record</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Selected Symptoms ({selectedSymptoms.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedSymptoms.map(id => {
                    const s = supportedSymptoms.find(x => x.id === id) ?? display(id)
                    return <span key={id} style={{ padding: '4px 10px', background: '#f0fdf9', border: '1px solid #0d9488', borderRadius: 20, fontSize: 12.5, color: '#0d9488', fontWeight: 600 }}>{s.label}</span>
                  })}
                </div>
              </div>

              {(temperatureC || heartRate || respiratoryRate) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Recorded Vital Signs</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {temperatureC && <span style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12.5, color: '#6b7280', fontWeight: 600 }}>{temperatureC} °C</span>}
                    {heartRate && <span style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12.5, color: '#6b7280', fontWeight: 600 }}>{heartRate} bpm</span>}
                    {respiratoryRate && <span style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12.5, color: '#6b7280', fontWeight: 600 }}>{respiratoryRate} breaths/min</span>}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ padding: '12px 14px', background: '#f0fdf9', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Model Version</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#0d9488' }}>Assigned at inference</div>
                  <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>TensorFlow.js · Server-side inference</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f0fdf9', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Symptom Map Version</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#0d9488' }}>SYMPTOM_MAP {mapVersion}</div>
                  <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>Approved features only</div>
                </div>
              </div>

              <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #0a1628, #0f2040)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Human Judgement Remains Essential</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                  The technical result generated is a bounded model output from synthetic demonstration data. It does not constitute a clinical assessment and must not replace professional evaluation.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={handleProcessing}>Run Technical Assessment →</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>Input Validation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 8 }}>
              <span style={{ color: '#16a34a', fontSize: 15 }}>✓</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>Client-side checks passed</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
              <div>● Synthetic record confirmed</div>
              <div>● {selectedSymptoms.length} supported symptoms selected</div>
              <div>● Server validation runs on submission</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Processing */}
      {step === 3 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0a1628', marginBottom: 8 }}>Running Technical Assessment</div>
            <div style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 28 }}>Server-side model inference</div>

            <div style={{ textAlign: 'left', marginBottom: 28 }}>
              {processingSteps.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    background: s.done ? '#16a34a' : s.active ? '#0d9488' : '#e2e8f0',
                    color: s.done || s.active ? 'white' : '#9ca3af',
                  }}>
                    {s.done ? '✓' : s.active ? '●' : '○'}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: s.done ? '#374151' : s.active ? '#0a1628' : '#9ca3af' }}>{s.label}</span>
                  {s.active && isProcessing && <div style={{ marginLeft: 'auto', width: 16, height: 16, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Inference</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0a1628' }}>Server-side</div>
              </div>
              <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Runtime</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0a1628' }}>TensorFlow.js</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Result */}
      {step === 4 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0a1628', margin: 0 }}>
                  {abstained ? 'No Technical Result Reported' : 'Technical Assessment Result'}
                </h3>
                <span className="not-diagnosis-badge">Not a Diagnosis</span>
              </div>

              {/* Main result */}
              {abstained ? (
                <div style={{ padding: '28px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>Model Output Withheld</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#334155', letterSpacing: '-0.02em', marginBottom: 16 }}>
                    {result?.status === 'OUT_OF_SCOPE' ? 'Out of Scope' : 'Insufficient Information'}
                  </div>
                  <div style={{ height: 1, background: '#e2e8f0', marginBottom: 16 }} />
                  <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
                    {result?.reason ?? 'No label is reported for this input.'}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '28px', background: 'linear-gradient(135deg, #0a1628, #0f2040)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>Model Output</div>
                  <div style={{ fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: 16 }}>
                    {result?.results[0] ? result.results[0].label.replace(/\b\w/g, c => c.toUpperCase()) : '—'}
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Model Score</div>
                  <div className="score-display">{result?.results[0] ? result.results[0].score.toFixed(2) : '—'}</div>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{ padding: '14px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6 }}>
                  {abstained
                    ? 'The system withheld a label rather than forcing one. This is a normal bounded outcome, not an error, and does not indicate the absence of any condition. Clinical evaluation is unaffected by this result.'
                    : 'This result is generated by a restricted four-condition machine-learning model using synthetic demonstration data. It does not confirm or exclude disease and must not replace professional clinical assessment.'}
                </div>
              </div>

              {/* Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Assessment ID', value: assessmentId },
                  { label: 'Model', value: `MediAI Classifier ${result?.modelVersion ?? ''}` },
                  { label: 'Symptom Map', value: `SYMPTOM_MAP ${result?.symptomMapVersion ?? ''}` },
                  { label: 'Input', value: 'Synthetic Demo Record' },
                  { label: 'Inference', value: 'Server-side' },
                  { label: 'Session Status', value: result?.status ?? '—' },
                ].map(m => (
                  <div key={m.label} style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: '#374151' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={resetForm}>New Assessment</button>
                <button className="btn-primary" onClick={() => navigate('/app/history')}>View Assessment History</button>
              </div>
            </div>
          </div>

          {/* Scope panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>Model Scope</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Supported Labels</div>
              {['Malaria', 'Typhoid Fever', 'Pneumonia', 'Diabetes Mellitus'].map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: '#374151' }}>{c}</span>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Outside Scope</div>
                {['Other diseases', 'Unsupported symptom combinations', 'Comorbid presentations', 'Distributionally dissimilar inputs'].map(o => (
                  <div key={o} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
                    <span style={{ color: '#9ca3af', fontSize: 13, flexShrink: 0 }}>✕</span>
                    <span style={{ fontSize: 12.5, color: '#9ca3af' }}>{o}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Clinical Boundary</div>
              <div style={{ fontSize: 12.5, color: '#991b1b', lineHeight: 1.6 }}>
                Human judgement remains essential. This output is a technical model result only and carries no clinical weight.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}