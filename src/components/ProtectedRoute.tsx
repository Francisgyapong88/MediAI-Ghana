import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Single source of truth for where each role lands. Used by ProtectedRoute's
// wrong-role fallback and by Login after a successful sign-in, so the two
// can't drift apart.
export function homeFor(role: string | undefined) {
  if (role === 'ADMIN') return '/admin/dashboard'
  if (role === 'SUPERVISOR_AUDITOR') return '/review/audit'
  return '/app/dashboard'
}

export default function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060d1a', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
        Verifying session…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />
  }

  return <Outlet />
}