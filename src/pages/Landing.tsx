import { NavLink } from 'react-router-dom'
import { Logo } from '../components/Logo'

const features = [
  {
    icon: <BoundedIcon />,
    title: 'Bounded Classification',
    desc: 'Four predefined model labels with explicit out-of-scope handling. No forced outputs beyond the active model scope.',
  },
  {
    icon: <HumanIcon />,
    title: 'Human Oversight',
    desc: 'Outputs support professional judgement and do not replace it. Human assessment remains essential at every stage.',
  },
  {
    icon: <LockIcon />,
    title: 'Secure Access',
    desc: 'Server-enforced role-based permissions and protected sessions with HTTP-only cookies and inactivity timeouts.',
  },
  {
    icon: <AuditIcon />,
    title: 'Transparent Evaluation',
    desc: 'Versioned model, symptom mapping, audit events and reproducible technical evaluation. Full traceability.',
  },
]

const conditions = [
  { label: 'Malaria', code: 'MLR' },
  { label: 'Typhoid Fever', code: 'TYP' },
  { label: 'Pneumonia', code: 'PNE' },
  { label: 'Diabetes Mellitus', code: 'DIA' },
]

const publicLinks = [
  { to: '/about', label: 'About' },
  { to: '/intended-use', label: 'Intended Use' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/evaluation', label: 'Evaluation' },
  { to: '/limitations', label: 'Limitations' },
  { to: '/safety', label: 'Safety & AI' },
]

export default function Landing() {
  return (
    <div style={{ background: '#060d1a', minHeight: '100vh', color: 'white' }}>
      {/* Nav */}
      <nav className="nav-public">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size="compact" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {publicLinks.map(l => (
              <NavLink key={l.to} to={l.to} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <NavLink to="/login">
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13.5 }}>Sign In</button>
          </NavLink>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient grid-bg" style={{ padding: '80px 24px 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 40%, rgba(13,148,136,0.1) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="research-badge">Research Prototype</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Not for Clinical Diagnosis or Treatment</span>
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 8 }}>
                MediAI <span style={{ color: '#14b8a6' }}>Ghana</span>
              </h1>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0d9488', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
                Non-Diagnostic Clinical Decision-Support Prototype
              </div>
              <p style={{ fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 16 }}>
                Technical Decision Support.<br />
                <strong style={{ color: 'white', fontWeight: 700 }}>Human Judgement First.</strong>
              </p>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                Structured symptom capture, bounded machine-learning classification and transparent technical evaluation â€” designed for academic demonstration and responsible AI research.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <NavLink to="/login">
                  <button className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>Sign In</button>
                </NavLink>
                <NavLink to="/about">
                  <button className="btn-secondary" style={{ padding: '13px 28px', fontSize: 15, background: 'transparent', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    Explore Prototype
                  </button>
                </NavLink>
              </div>
            </div>

            {/* Right â€” Dashboard mockup */}
            <div style={{ position: 'relative' }}>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Safety Banner */}
      <section style={{ background: '#0a1628', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 4, height: 40, background: '#dc2626', borderRadius: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 3 }}>
              Important Clinical Boundary â€” Human Judgement Remains Essential
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              MediAI Ghana is a non-diagnostic technical prototype. Its outputs are bounded model results generated from synthetic demonstration records. The system does not confirm or exclude disease, prescribe treatment, provide clinical probability, or replace professional assessment.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#0a1628', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#0d9488', textTransform: 'uppercase', marginBottom: 12 }}>Core Principles</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Designed Around Responsible AI</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto' }}>
              Every design decision in MediAI Ghana reflects the principles of responsible clinical AI development.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '28px 22px',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div style={{ marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section style={{ background: '#060d1a', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#0d9488', textTransform: 'uppercase', marginBottom: 12 }}>Model Scope</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>Current Model Scope</h2>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 12 }}>
                The active machine-learning component operates with exactly <strong style={{ color: 'white' }}>four demonstration labels</strong>. These are bounded technical outputs, not clinical classifications.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.25)', borderRadius: 6, padding: '6px 12px', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0d9488' }}>4-label demonstration model</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                Other conditions are outside the active model scope. The system will not force an unsupported case into a disease label.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {conditions.map(c => (
                <div key={c.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(13,148,136,0.2)',
                  borderRadius: 10,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#0d9488', fontWeight: 600, letterSpacing: '0.08em' }}>{c.code}</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.label}</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Technical model label</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#060d1a', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size="compact" />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
            MediAI Ghana â€” Undergraduate Final-Year Project Â· Non-Diagnostic Research Prototype
          </div>
          <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Not for Clinical Use
          </div>
        </div>
      </footer>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div style={{
      background: 'rgba(10,22,40,0.8)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14,
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
    }}>
      {/* Window chrome */}
      <div style={{ background: '#060d1a', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>MediAI Ghana â€” Evaluator Dashboard</span>
      </div>
      {/* Safety banner */}
      <div style={{ background: 'rgba(220,38,38,0.08)', borderBottom: '1px solid rgba(220,38,38,0.15)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 3, height: 24, background: '#dc2626', borderRadius: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 8, fontWeight: 800, color: '#ef4444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Research Prototype â€” Not for Clinical Diagnosis</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Technical model outputs from synthetic demonstration records</div>
        </div>
      </div>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.04)', padding: '1px' }}>
        {[
          { label: 'Total Assessments', value: '47', sub: 'Synthetic records' },
          { label: 'Supported Conditions', value: '4', sub: 'Model Labels' },
          { label: 'Model Version', value: 'v1.0.0', sub: 'MediAI Classifier' },
          { label: 'Symptom Map', value: 'v1.0.0', sub: 'SYMPTOM_MAP' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0a1628', padding: '14px 12px' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 8.5, color: '#0d9488', marginTop: 2, fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      {/* Table preview */}
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recent Assessments</div>
        {[
          { id: 'ASS-0012', output: 'Malaria', score: '0.91', status: 'Completed', color: '#16a34a' },
          { id: 'ASS-0011', output: 'â€”', score: 'â€”', status: 'Insufficient Info', color: '#d97706' },
          { id: 'ASS-0010', output: 'Diabetes mellitus', score: '0.81', status: 'Completed', color: '#16a34a' },
        ].map(row => (
          <div key={row.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginBottom: 3 }}>
            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{row.id}</span>
            <span style={{ fontSize: 9, color: 'white', fontWeight: 600 }}>{row.output}</span>
            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#0d9488' }}>{row.score}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: row.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BoundedIcon() {
  return <div style={{ width: 44, height: 44, background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="#0d9488" strokeWidth="1.5" /><path d="M3 10h14M10 3v14" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" /><circle cx="10" cy="10" r="2.5" fill="#0d9488" /></svg>
  </div>
}
function HumanIcon() {
  return <div style={{ width: 44, height: 44, background: 'rgba(29,78,216,0.15)', border: '1px solid rgba(29,78,216,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="3" stroke="#3b82f6" strokeWidth="1.5" /><path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#3b82f6" strokeWidth="1.5" /><path d="M10 11v3l2 1" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" /></svg>
  </div>
}
function LockIcon() {
  return <div style={{ width: 44, height: 44, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="2" stroke="#ef4444" strokeWidth="1.5" /><path d="M7 9V7a3 3 0 016 0v2" stroke="#ef4444" strokeWidth="1.5" /><circle cx="10" cy="13.5" r="1.5" fill="#ef4444" /></svg>
  </div>
}
function AuditIcon() {
  return <div style={{ width: 44, height: 44, background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="#d97706" strokeWidth="1.5" /><line x1="7" y1="7" x2="13" y2="7" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="10" x2="13" y2="10" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="13" x2="10" y2="13" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" /></svg>
  </div>
}
