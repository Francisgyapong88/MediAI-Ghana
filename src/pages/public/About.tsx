import { NavLink } from 'react-router-dom'
import { Logo } from '../../components/Logo'

const sections = [
  {
    title: 'What is MediAI Ghana?',
    content: `MediAI Ghana is an undergraduate final-year computer science project demonstrating a web-based clinical decision-support workflow. It uses a restricted four-condition machine-learning classifier trained on synthetic symptom data to produce bounded technical outputs for academic evaluation purposes.

It is not a medical product, clinical tool, or commercial service. It is a research prototype designed to demonstrate responsible AI development principles in a healthcare context.`,
  },
  {
    title: 'Why was it developed?',
    content: `MediAI Ghana was developed to demonstrate how structured, bounded, and transparent machine-learning systems can be designed with appropriate safety boundaries from the outset. The project explores clinical decision support as a technical research challenge — not as a clinical product.

The Ghanaian context provides a specific and meaningful academic framing for the four-label scope (Malaria, Typhoid Fever, Pneumonia, Diabetes Mellitus), all of which are conditions relevant to sub-Saharan African primary healthcare settings.`,
  },
  {
    title: 'What does it demonstrate?',
    content: `The prototype demonstrates: structured synthetic symptom capture, a bounded four-label machine-learning classification workflow, explicit out-of-scope and abstention handling (no forced disease label), transparent model versioning and symptom map versioning, role-based access control with server-enforced permissions, immutable audit logging, and technical evaluation methodology for machine-learning systems.`,
  },
  {
    title: 'What does it NOT do?',
    content: `MediAI Ghana does not diagnose disease, confirm or exclude disease, prescribe medication or treatment, provide clinical probability estimates, replace professional clinical judgement, process real patient data, claim clinical effectiveness or validity, provide emergency services, make autonomous referrals, or assert readiness for clinical deployment.`,
  },
  {
    title: 'Who can use the prototype?',
    content: `Access is restricted to authorised university personnel: evaluators (who run technical assessments), supervisors and auditors (who review the evaluation evidence), and system administrators (who manage the configuration). There is no public registration. All access requires administrator-created credentials.`,
  },
  {
    title: 'What are its limitations?',
    content: `The prototype uses a small externally-sourced dataset not derived from Ghanaian clinical settings, a four-label model that covers only a fraction of clinical presentations, synthetic records that do not reflect the complexity of real clinical encounters, and no external usability validation or clinical adviser review. These limitations are by design, not by oversight — the prototype is transparent about its boundaries.`,
  },
]

export default function About() {
  return (
    <div style={{ background: '#060d1a', minHeight: '100vh', color: 'white' }}>
      {/* Nav */}
      <nav className="nav-public">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }}><Logo size="compact" /></NavLink>
          <NavLink to="/login"><button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13.5 }}>Sign In</button></NavLink>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #060d1a, #0a1628)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="research-badge" style={{ marginBottom: 16 }}>Research Prototype</div>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>About MediAI Ghana</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            A non-diagnostic clinical decision-support prototype for structured synthetic symptom assessment, bounded machine-learning classification and transparent technical evaluation.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        {sections.map((s, i) => (
          <div key={s.title} style={{ marginBottom: 48, paddingBottom: 48, borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: 'white' }}>{s.title}</h2>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
              {s.content.split('\n\n').map((para, j) => (
                <p key={j} style={{ marginBottom: j < s.content.split('\n\n').length - 1 ? 14 : 0 }}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        MediAI Ghana — Undergraduate Research Prototype · Not for Clinical Use
      </div>
    </div>
  )
}
