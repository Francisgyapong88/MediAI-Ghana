import { NavLink } from 'react-router-dom'
import { Logo } from '../../components/Logo'

export default function Architecture() {
  return (
    <div style={{ background: '#060d1a', minHeight: '100vh', color: 'white' }}>
      <nav className="nav-public">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }}><Logo size="compact" /></NavLink>
          <NavLink to="/login"><button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13.5 }}>Sign In</button></NavLink>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #060d1a, #0a1628)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="research-badge" style={{ marginBottom: 16 }}>System Architecture</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>System Architecture</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Technical architecture of the MediAI Ghana prototype. Model inference is server-side only.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        {/* Architecture diagram */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, marginBottom: 48 }}>
          {/* Client side */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Client — Browser</div>
            {['React 19', 'TypeScript', 'Tailwind CSS', 'React Router'].map(t => (
              <div key={t} style={{ padding: '10px 12px', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 8, marginBottom: 8, fontSize: 13.5, fontFamily: "'JetBrains Mono', monospace" }}>{t}</div>
            ))}
            <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, fontSize: 11.5, color: '#ef4444' }}>
              ✕ No model inference in browser
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 4 }}>HTTPS</div>
            <div style={{ fontSize: 20, color: '#0d9488' }}>⟷</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Auth Cookie</div>
          </div>

          {/* Server side */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Server — Node.js</div>
            {['Express.js', 'TypeScript', 'Passport.js (Auth)', 'Session Management', 'Input Validation', 'Audit Logger', 'RBAC Middleware'].map(t => (
              <div key={t} style={{ padding: '8px 12px', background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.15)', borderRadius: 8, marginBottom: 7, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Data layer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 14 }}>Data Layer</div>
            <div style={{ padding: '14px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, textAlign: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>MySQL</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Assessment records · User accounts · Audit log · Version metadata</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#0d9488', textTransform: 'uppercase', marginBottom: 14 }}>ML Inference Layer (Server-Side)</div>
            <div style={{ padding: '14px', background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.25)', borderRadius: 10, textAlign: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>TensorFlow.js</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>MediAI Classifier v1.0 · 4-label · Frozen model weights</div>
            </div>
            <div style={{ fontSize: 12, color: '#2dd4bf', fontWeight: 600 }}>
              ✓ Inference occurs on the server — model never sent to browser
            </div>
          </div>
        </div>

        {/* Security architecture */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Security Architecture</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
            {['User Request', 'Authentication', 'Role Verification', 'Server Permission Check', 'Protected Operation', 'Audit Event'].map((step, i, arr) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ padding: '10px 16px', background: i === arr.length - 1 ? 'rgba(16,163,74,0.15)' : 'rgba(13,148,136,0.1)', border: `1px solid ${i === arr.length - 1 ? 'rgba(16,163,74,0.3)' : 'rgba(13,148,136,0.2)'}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {step}
                </div>
                {i < arr.length - 1 && <span style={{ color: '#0d9488', margin: '0 6px', fontSize: 14 }}>→</span>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Hiding a button is not a security control. Every operation is verified server-side using session authentication and role-based access checks, regardless of the client state.
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        MediAI Ghana — System Architecture · Research Prototype
      </div>
    </div>
  )
}
