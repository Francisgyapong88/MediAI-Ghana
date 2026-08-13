import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import EvaluatorLayout from './components/layout/EvaluatorLayout'
import AdminLayout from './components/layout/AdminLayout'
import SupervisorLayout from './components/layout/SupervisorLayout'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import About from './pages/public/About'
import TechnicalEvaluation from './pages/public/TechnicalEvaluation'
import Limitations from './pages/public/Limitations'
import Architecture from './pages/public/Architecture'

// Evaluator pages
import EvaluatorDashboard from './pages/evaluator/Dashboard'
import NewAssessment from './pages/evaluator/NewAssessment'
import AssessmentHistory from './pages/evaluator/AssessmentHistory'
import AssessmentDetail from './pages/evaluator/AssessmentDetail'
import ModelInformation from './pages/evaluator/ModelInformation'
import SymptomMap from './pages/evaluator/SymptomMap'
import AccountSecurity from './pages/evaluator/AccountSecurity'
import SystemStatus from './pages/evaluator/SystemStatus'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UsersRoles from './pages/admin/UsersRoles'
import SystemAudit from './pages/admin/SystemAudit'
import AdminModelVersions from './pages/admin/ModelVersions'
import AdminRetention from './pages/admin/Retention'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Placeholder — section headings only, no content written yet.
function Docs() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', marginBottom: 4 }}>Documentation</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Planned documentation sections. Content is not written in this build.</p>
      <div className="card">
        {['Project Purpose', 'Intended Use', 'Model Scope', 'Safety Boundaries', 'Architecture', 'Data Governance', 'Security', 'Evaluation', 'Limitations'].map(s => (
          <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{s}</span>
            <span style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 600 }}>Not written</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/evaluation" element={<TechnicalEvaluation />} />
          <Route path="/limitations" element={<Limitations />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/intended-use" element={<About />} />
          <Route path="/safety" element={<Limitations />} />

          {/* Evaluator — evaluators and admins. The read-only role has its
              own area at /review and is excluded here. */}
          <Route element={<ProtectedRoute roles={['EVALUATOR', 'ADMIN']} />}>
            <Route path="/app" element={<EvaluatorLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EvaluatorDashboard />} />
              {/* Mutation — guarded again as defence in depth (FR-10) */}
              <Route element={<ProtectedRoute roles={['EVALUATOR', 'ADMIN']} />}>
                <Route path="new-assessment" element={<NewAssessment />} />
              </Route>
              <Route path="history" element={<AssessmentHistory />} />
              <Route path="history/:id" element={<AssessmentDetail />} />
              <Route path="model" element={<ModelInformation />} />
              <Route path="symptom-map" element={<SymptomMap />} />
              <Route path="account" element={<AccountSecurity />} />
              <Route path="status" element={<SystemStatus />} />
              <Route path="docs" element={<Docs />} />
            </Route>
          </Route>

          {/* Supervisor / Auditor — read-only technical evidence (FR-10).
              Every route here is a read; no mutation is reachable.
              Technical evaluation is public and opens at /evaluation. */}
          <Route element={<ProtectedRoute roles={['SUPERVISOR_AUDITOR', 'ADMIN']} />}>
            <Route path="/review" element={<SupervisorLayout />}>
              <Route index element={<Navigate to="audit" replace />} />
              <Route path="audit" element={<SystemAudit />} />
              <Route path="model" element={<ModelInformation />} />
              <Route path="model-versions" element={<AdminModelVersions />} />
              <Route path="symptom-map" element={<SymptomMap />} />
              <Route path="status" element={<SystemStatus />} />
              <Route path="account" element={<AccountSecurity />} />
              <Route path="docs" element={<Docs />} />
            </Route>
          </Route>

          {/* Admin — ADMIN only */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="history" element={<AssessmentHistory />} />
              <Route path="history/:id" element={<AssessmentDetail />} />
              <Route path="users" element={<UsersRoles />} />
              <Route path="model-versions" element={<AdminModelVersions />} />
              <Route path="symptom-versions" element={<SymptomMap />} />
              <Route path="audit" element={<SystemAudit />} />
              <Route path="retention" element={<AdminRetention />} />
              <Route path="account" element={<AccountSecurity />} />
              <Route path="status" element={<SystemStatus />} />
              <Route path="docs" element={<Docs />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060d1a', color: 'white' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 72, fontWeight: 900, color: '#0d9488', marginBottom: 8 }}>404</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Page not found</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>The requested resource does not exist in this prototype.</div>
              <a href="/" style={{ textDecoration: 'none' }}><button className="btn-primary">Return to Home</button></a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}