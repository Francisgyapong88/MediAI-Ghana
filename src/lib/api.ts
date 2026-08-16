const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    })
  } catch {
    // The request never reached the server — server down, DNS failure, or
    // CORS rejection. This must not be reported as a credential or data
    // error, because the cause is a dependency failure (NFR-02).
    throw new ApiError(0, 'NetworkError', 'Could not reach the server.')
  }

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    // A 401 on an authenticated route means the sliding session window
    // lapsed (NFR-01). /auth/me is the startup probe and /auth/login is a
    // credential failure — neither is an expiry, so both are excluded.
    if (res.status === 401 && path !== '/auth/me' && path !== '/auth/login') {
      window.dispatchEvent(new CustomEvent('mediai:session-expired'))
    }

    throw new ApiError(
      res.status,
      body.error ?? 'UnknownError',
      body.message ?? 'Something went wrong.',
    )
  }

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
}

export interface SessionUser {
  id: number
  role: 'ADMIN' | 'EVALUATOR' | 'SUPERVISOR_AUDITOR'
  username?: string
}