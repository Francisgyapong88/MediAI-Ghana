import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type SessionUser } from '../lib/api'

interface AuthState {
  user: SessionUser | null
  loading: boolean
  sessionExpired: boolean
  justLoggedIn: boolean
  login: (username: string, password: string) => Promise<SessionUser>
  logout: () => Promise<void>
  clearExpiry: () => void
  dismissWelcome: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  // In-memory only, so the greeting shows once per sign-in and does not
  // reappear on refresh or when navigating back to a landing page.
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  useEffect(() => {
    api
      .get<SessionUser>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // The api wrapper raises this when an authenticated route returns 401,
  // which means the sliding session window lapsed (NFR-01).
  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      setSessionExpired(true)
      setJustLoggedIn(false)
    }
    window.addEventListener('mediai:session-expired', onExpired)
    return () => window.removeEventListener('mediai:session-expired', onExpired)
  }, [])

  async function login(username: string, password: string) {
    setSessionExpired(false)
    const u = await api.post<SessionUser>('/auth/login', { username, password })
    setUser(u)
    setJustLoggedIn(true)
    return u
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    setUser(null)
    setSessionExpired(false)
    setJustLoggedIn(false)
  }

  function clearExpiry() {
    setSessionExpired(false)
  }

  function dismissWelcome() {
    setJustLoggedIn(false)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionExpired, justLoggedIn, login, logout, clearExpiry, dismissWelcome }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}