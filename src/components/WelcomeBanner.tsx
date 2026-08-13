import { useAuth } from '../context/AuthContext'

const ROLE_MESSAGE: Record<string, { title: string; body: string; accent: string; bg: string; border: string }> = {
  ADMIN: {
    title: 'Administrator access',
    body: 'You can manage accounts and roles, review the system audit log, and inspect active model and symptom-map versions.',
    accent: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  EVALUATOR: {
    title: 'Evaluator access',
    body: 'You can create synthetic demonstration records and run bounded technical assessments. Outputs are model results only and carry no clinical weight.',
    accent: '#0d9488',
    bg: '#f0fdfa',
    border: '#99f6e4',
  },
  SUPERVISOR_AUDITOR: {
    title: 'Read-only review access',
    body: 'You can view audit events, configuration and version evidence. No record in this system can be created or modified from this account.',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function WelcomeBanner() {
  const { user, justLoggedIn, dismissWelcome } = useAuth()

  if (!justLoggedIn || !user) return null

  const m = ROLE_MESSAGE[user.role]
  if (!m) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '16px 18px',
      background: m.bg,
      border: `1px solid ${m.border}`,
      borderRadius: 10,
      marginBottom: 20,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>
          {greeting()}, {user.username ?? 'there'}.
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: m.accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
          {m.title}
        </div>
        <div style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6 }}>
          {m.body}
        </div>
      </div>
      <button
        onClick={dismissWelcome}
        aria-label="Dismiss welcome message"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#9ca3af',
          fontSize: 18,
          lineHeight: 1,
          padding: 4,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}