import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './store/auth'
import { DashboardLayout } from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Overview from './pages/Overview'
import TargetsPage from './pages/Targets'
import EvaluationsPage from './pages/Evaluations'
import EvaluationDetail from './pages/EvaluationDetail'
import FindingsPage from './pages/Findings'
import LibraryPage from './pages/Library'
import ReportPage from './pages/Report'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, init } = useAuth()
  const loc = useLocation()
  useEffect(() => { init() }, [])
  const token = localStorage.getItem('invictus_token')
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />
  return <>{children}</>
}

export default function App() {
  const { init } = useAuth()
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<RequireAuth><DashboardLayout><Overview /></DashboardLayout></RequireAuth>} />
        <Route path="/dashboard/targets" element={<RequireAuth><DashboardLayout><TargetsPage /></DashboardLayout></RequireAuth>} />
        <Route path="/dashboard/evaluations" element={<RequireAuth><DashboardLayout><EvaluationsPage /></DashboardLayout></RequireAuth>} />
        <Route path="/dashboard/evaluations/:id" element={<RequireAuth><DashboardLayout><EvaluationDetail /></DashboardLayout></RequireAuth>} />
        <Route path="/dashboard/findings" element={<RequireAuth><DashboardLayout><FindingsPage /></DashboardLayout></RequireAuth>} />
        <Route path="/dashboard/library" element={<RequireAuth><DashboardLayout><LibraryPage /></DashboardLayout></RequireAuth>} />
        <Route path="/dashboard/reports" element={<RequireAuth><DashboardLayout><ReportPage /></DashboardLayout></RequireAuth>} />
        <Route path="/dashboard/reports/:id" element={<RequireAuth><DashboardLayout><ReportPage /></DashboardLayout></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
