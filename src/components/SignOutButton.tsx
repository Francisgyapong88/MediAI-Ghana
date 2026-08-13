import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignOutButton({ variant = 'link' }: { variant?: 'link' | 'block' }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const confirm = async () => {
    setBusy(true)
    await logout()
    navigate('/login', { replace: true })
  }

  const trigger =
    variant === 'block' ? (
      <button
        onClick={() => setConfirming(true)}
        className="btn-secondary"
        style={{ width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fecaca' }}
      >
        Sign Out
      </button>
    ) : (
      <button
        onClick={() => setConfirming(true)}
        style={{ fontSize: 12.5, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
      >
        Sign Out
      </button>
    )

  return (
    <>
      {trigger}

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
          onClick={() => !busy && setConfirming(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6,13,26,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: '24px',
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div id="signout-title" style={{ fontSize: 17, fontWeight: 800, color: '#0a1628', marginBottom: 8 }}>
              Sign out of MediAI Ghana?
            </div>
            <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
              Your session will be revoked on the server. Any assessment you have started but not submitted will be lost.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirming(false)}
                disabled={busy}
                className="btn-secondary"
                style={{ padding: '9px 18px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={busy}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: busy ? 'default' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}