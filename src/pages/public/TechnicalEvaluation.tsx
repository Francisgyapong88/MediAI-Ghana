import { NavLink } from 'react-router-dom'
import { Logo } from '../../components/Logo'

const protocol = [
  {
    title: 'Dataset Integrity',
    items: [
      'Externally sourced demonstration data',
      'Pre-training dataset freeze',
      'Grouped near-duplicate audit',
      'Grouped stratified partitioning',
    ],
  },
  {
    title: 'Baseline Comparison',
    items: [
      'Random baseline across four labels',
      'Majority-class baseline computed per class',
      'Model improvement reported against both',
    ],
  },
  {
    title: 'Final Classifier Test',
    items: [
      'Accuracy, macro precision, macro recall, macro F1',
      'Per-class confusion matrix',
      'Frozen hold-out set, unseen during training',
    ],
  },
  {
    title: 'Abstention Behaviour',
    items: [
      'Insufficient-information cases return no label',
      'Out-of-scope cases return explicit abstention',
      'Threshold selected from validation evidence only',
    ],
  },
]

const securityCases = [
  'Authentication rate limiting',
  'Role-based access enforced server-side',
  'Prohibited mutation returns 403',
  'Session timeout triggers re-authentication',
  'Audit events written for privileged operations',
  'No secrets present in audit records',
]

const safetyCases = [
  'Out-of-scope input returns explicit abstention',
  'Insufficient information returns no label',
  'Dependency failure returns no fabricated result',
  'Disabled blood-pressure feature is unreachable',
  'Disabled symptom terms are rejected by the server',
  'Frozen symptom map governs accepted input',
]

export default function TechnicalEvaluation() {
  return (
    <div style={{ background: '#060d1a', minHeight: '100vh', color: 'white' }}>
      <nav className="nav-public">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }}><Logo size="compact" /></NavLink>
          <NavLink to="/login"><button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13.5 }}>Sign In</button></NavLink>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #060d1a, #0a1628)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="research-badge" style={{ marginBottom: 20 }}>Research Prototype</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Technical Evaluation</h1>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 720 }}>
            The evaluation protocol for the four-label demonstration classifier, and the current status of its results.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        {/* Results-pending notice */}
        <div style={{ padding: '20px 24px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Results Not Yet Published
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            The trained TensorFlow.js classifier (model v1.0.0) is connected and deployed, and produces genuine predictions rather than a fixed placeholder output. Conformance testing against the original Python-trained model showed 96 of 96 test cases matched. However, no accuracy, precision, recall, F1 or confusion-matrix results from the formal evaluation protocol below are reported on this page yet, because that protocol has not been executed against the deployed system. Results will be published against this named model version once the protocol below is carried out.
          </div>
        </div>

        {/* Standing disclaimer */}
        <div style={{ padding: '16px 20px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, marginBottom: 36, display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>âš </span>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
            <strong style={{ color: 'white' }}>Technical Evaluation â€” Not Clinical Validation.</strong> Accuracy, precision, recall, specificity and F1 are machine-learning performance metrics applied to a demonstration dataset. Such results, once available, would not establish clinical accuracy, diagnostic validity, or suitability for clinical deployment.
          </div>
        </div>

        {/* Protocol */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          {protocol.map(s => (
            <div key={s.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>{s.title}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Planned
                </span>
              </div>
              {s.items.map(i => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>â—</span>
                  {i}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Confusion matrix placeholder */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, padding: '28px', marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Confusion Matrix</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Will be published here once the classifier has been evaluated against the frozen hold-out set. Reporting an illustrative or placeholder matrix would misrepresent the system's measured behaviour, so none is shown.
          </div>
        </div>

        {/* Test case registers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Security & Authorisation Cases</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Defined cases. Outcomes are recorded in the project test record.</div>
            {securityCases.map(item => (
              <div key={item} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>â—</span>
                {item}
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Functional & Safety Cases</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Defined cases. Outcomes are recorded in the project test record.</div>
            {safetyCases.map(item => (
              <div key={item} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>â—</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        MediAI Ghana â€” Technical Evaluation Â· Not Clinical Validation
      </div>
    </div>
  )
}
