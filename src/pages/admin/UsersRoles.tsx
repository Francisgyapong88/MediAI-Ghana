import { useState, useEffect } from 'react'
import { api, ApiError } from '../../lib/api'

interface AdminUser {
  id: number
  username: string
  status: string
  createdAt: string
  role: { name: string } | null
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  EVALUATOR: 'Evaluator',
  SUPERVISOR_AUDITOR: 'Supervisor / Auditor',
}

const roleColor: Record<string, string> = {
  ADMIN: '#d97706',
  EVALUATOR: '#0369a1',
  SUPERVISOR_AUDITOR: '#7c3aed',
}

const rolePermissions = {
  ADMIN: {
    can: ['Create accounts', 'Suspend accounts', 'Assign roles', 'Activate frozen model version', 'Activate symptom-map version', 'Configure retention', 'View system audit events'],
    cannot: ['Create clinical thresholds', 'Activate blood-pressure functionality without clinical approval', 'Alter frozen evaluation data'],
  },
  EVALUATOR: {
    can: ['Create synthetic records', 'Edit own records', 'Delete own records', 'Submit supported symptoms', 'View bounded outputs', 'View own history'],
    cannot: ['Manage accounts', 'Change model versions', 'Change symptom-map versions', "View another evaluator's records", 'Modify audit events', 'Access disabled clinical features'],
  },
  SUPERVISOR_AUDITOR: {
    can: ['View configuration', 'View version metadata', 'View test evidence', 'View audit events'],
    cannot: ['Modify records', 'Run administrative operations', 'Change versions', 'Delete audit evidence'],
  },
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function UsersRoles() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState<keyof typeof rolePermissions>('EVALUATOR')

  const [showCreate, setShowCreate] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('EVALUATOR')
  const [creating, setCreating] = useState(false)

  const load = () =>
    api
      .get<AdminUser[]>('/admin/users')
      .then(setUsers)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Could not load users.'))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const setStatus = async (id: number, status: string) => {
    setBusyId(id)
    setError(null)
    try {
      await api.patch(`/admin/users/${id}/status`, { status })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update that account.')
    } finally {
      setBusyId(null)
    }
  }

  const setRole = async (id: number, role: string) => {
    setBusyId(id)
    setError(null)
    try {
      await api.patch(`/admin/users/${id}/role`, { role })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update that role.')
    } finally {
      setBusyId(null)
    }
  }

  const createAccount = async () => {
    setCreating(true)
    setError(null)
    try {
      await api.post('/admin/users', { username: newUsername, password: newPassword, role: newRole })
      setNewUsername('')
      setNewPassword('')
      setNewRole('EVALUATOR')
      setShowCreate(false)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create that account.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', letterSpacing: '-0.02em', marginBottom: 4 }}>Users & Roles</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage authorised users and role-based access control.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Cancel' : '+ Create Account'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Request failed</div>
          <div style={{ fontSize: 12.5, color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 14 }}>Create Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Username</label>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="evaluator.a" autoComplete="off" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Initial Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                {Object.keys(ROLE_LABELS).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <button
              className="btn-primary"
              disabled={creating || !newUsername || newPassword.length < 8}
              style={{ opacity: creating || !newUsername || newPassword.length < 8 ? 0.4 : 1 }}
              onClick={createAccount}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 10 }}>
            The initial password is set by the administrator and transmitted out of band. It is hashed server-side and never stored or displayed in plaintext.
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628' }}>Authorised Users</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>No public registration. All accounts created by administrators only.</div>
        </div>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const roleName = u.role?.name ?? ''
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0a1628' }}>{u.username}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#9ca3af' }}>USR-{String(u.id).padStart(3, '0')}</div>
                  </td>
                  <td>
                    <select
                      value={roleName}
                      disabled={busyId === u.id}
                      onChange={e => setRole(u.id, e.target.value)}
                      style={{ fontSize: 12, padding: '4px 8px', color: roleColor[roleName] ?? '#374151', fontWeight: 700, width: 'auto', minWidth: 150 }}
                    >
                      {Object.keys(ROLE_LABELS).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td>
                    {u.status === 'ACTIVE'
                      ? <span className="tag tag-approved">● Active</span>
                      : <span className="tag tag-outofscope">⊘ {u.status}</span>}
                  </td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#6b7280' }}>{fmt(u.createdAt)}</td>
                  <td>
                    {u.status === 'ACTIVE' ? (
                      <button
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, 'INACTIVE')}
                        style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #fecaca', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#dc2626', fontWeight: 500 }}
                      >
                        {busyId === u.id ? '…' : 'Suspend'}
                      </button>
                    ) : (
                      <button
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, 'ACTIVE')}
                        style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #bbf7d0', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#16a34a', fontWeight: 500 }}
                      >
                        {busyId === u.id ? '…' : 'Restore'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>Loading users…</div>}
        {!loading && !error && users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>No accounts found.</div>
        )}
      </div>

      {/* Role permission matrix */}
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Role Permission Matrix</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Reference summary of the documented role design. Not read from the server.</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(Object.keys(rolePermissions) as (keyof typeof rolePermissions)[]).map(r => (
            <button key={r} onClick={() => setSelectedRole(r)} style={{
              padding: '8px 16px', borderRadius: 6, border: `1px solid ${selectedRole === r ? roleColor[r] : '#e2e8f0'}`,
              background: selectedRole === r ? `${roleColor[r]}18` : 'white',
              color: selectedRole === r ? roleColor[r] : '#6b7280',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Can</div>
            {rolePermissions[selectedRole].can.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0, fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 13.5, color: '#374151' }}>{p}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Cannot</div>
            {rolePermissions[selectedRole].cannot.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ color: '#dc2626', fontWeight: 700, flexShrink: 0, fontSize: 14 }}>✕</span>
                <span style={{ fontSize: 13.5, color: '#374151' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, padding: '12px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 12.5, color: '#0369a1', lineHeight: 1.5 }}>
          <strong>Security note:</strong> Role-based access is enforced server-side for every operation. Hiding a button in the UI is not the security mechanism — permissions are verified by the server on every request.
        </div>
      </div>
    </div>
  )
}