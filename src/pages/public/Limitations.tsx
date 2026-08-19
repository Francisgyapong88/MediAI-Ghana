import { NavLink } from 'react-router-dom'
import { Logo } from '../../components/Logo'

const limitations = [
  {
    title: 'Small externally-sourced dataset',
    detail: 'The training data is a publicly available demonstration dataset and does not originate from Ghanaian clinical settings. Dataset size limits generalisation claims.',
  },
  {
    title: 'Non-Ghanaian development data',
    detail: 'The dataset may not reflect disease prevalence patterns, symptom presentation profiles, or comorbidity rates relevant to Ghanaian primary healthcare.',
  },
  {
    title: 'Limited four-label model',
    detail: 'The classifier supports exactly four conditions: Malaria, Typhoid Fever, Pneumonia, and Diabetes Mellitus. This covers a small subset of clinical presentations.',
  },
  {
    title: 'Possible near-duplicate patterns',
    detail: 'Despite a duplicate audit phase, symptom-based records may exhibit near-duplicate patterns that could inflate evaluated performance beyond real-world generalisation.',
  },
  {
    title: 'No clinical validation',
    detail: 'Technical evaluation metrics (accuracy, F1, etc.) are machine-learning performance measures only. No clinical validation study has been conducted. No claims of clinical effectiveness are made.',
  },
  {
    title: 'No external usability study',
    detail: 'No formal usability evaluation with target clinical users has been conducted. Interface design decisions are based on established UX principles, not empirical user research.',
  },
  {
    title: 'Blood-pressure feature is disabled',
    detail: 'A blood-pressure classification component was considered but disabled. Activation requires qualified clinical approval, a versioned specification, and safety testing — none of which have been completed.',
  },
  {
    title: 'Low-connectivity limitations',
    detail: 'Performance testing at 400 kbps / 400 ms latency reveals acceptable but not optimal behaviour. Reliability in very low connectivity environments (< 200 kbps) has not been fully evaluated.',
  },
  {
    title: 'No regulatory approval',
    detail: 'MediAI Ghana has not been submitted to, reviewed by, or approved by any health regulatory authority in Ghana or internationally. It is not a regulated medical device.',
  },
  {
    title: 'No real patient data',
    detail: 'The system processes synthetic demonstration records only. No real patient, de-identified, or anonymised clinical records are accepted, stored, or processed.',
  },
  {
    title: 'Not deployment-ready',
    detail: 'This prototype is an undergraduate academic project. It has not been designed, evaluated, tested, or approved for deployment in any clinical or healthcare environment.',
  },
]

export default function Limitations() {
  return (
    <div style={{ background: '#060d1a', minHeight: '100vh', color: 'white' }}>
      <nav className="nav-public">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }}><Logo size="compact" /></NavLink>
          <NavLink to="/login"><button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13.5 }}>Sign In</button></NavLink>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #060d1a, #0a1628)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="research-badge" style={{ marginBottom: 16 }}>Responsible AI</div>
         <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Known Limitations</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Transparent acknowledgement of this prototype's technical and clinical limitations. Transparency about limitations is a strength of responsible AI design, not a weakness.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        {/* Framing */}
        <div style={{ padding: '18px 22px', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: 12, marginBottom: 36 }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
            <strong style={{ color: '#0d9488' }}>Responsible AI includes knowing your boundaries.</strong> The limitations listed here are known, documented, and intentionally communicated. A system that is honest about what it cannot do is safer than one that overstates its capabilities.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {limitations.map((l, i) => (
            <div key={l.title} style={{ display: 'flex', gap: 16, padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#0d9488', fontWeight: 700, width: 24, flexShrink: 0, paddingTop: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{l.title}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{l.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        MediAI Ghana — Responsible AI Research Prototype · Not for Clinical Use
      </div>
    </div>
  )
}
