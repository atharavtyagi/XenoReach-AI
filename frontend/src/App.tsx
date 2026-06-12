import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'

// Existing pages
import LandingPage from './pages/Landing'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerProfile from './pages/CustomerProfile'
import Segments from './pages/Segments'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import Copilot from './pages/Copilot'
import Analytics from './pages/Analytics'
import Integrations from './pages/Integrations'
import Architecture from './pages/Architecture'

// New enterprise pages
import DataQuality from './pages/DataQuality'
import AuditCenter from './pages/AuditCenter'
import DeploymentReadiness from './pages/DeploymentReadiness'
import CustomerSuccess from './pages/CustomerSuccess'
import ExecutiveInsights from './pages/ExecutiveInsights'
import SolutionRecommendations from './pages/SolutionRecommendations'
import ImplementationAssistant from './pages/ImplementationAssistant'
import WorkflowBuilder from './pages/WorkflowBuilder'
import ImplementationTracker from './pages/ImplementationTracker'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Existing private routes */}
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Layout><Customers /></Layout></PrivateRoute>} />
        <Route path="/customers/:id" element={<PrivateRoute><Layout><CustomerProfile /></Layout></PrivateRoute>} />
        <Route path="/segments" element={<PrivateRoute><Layout><Segments /></Layout></PrivateRoute>} />
        <Route path="/campaigns" element={<PrivateRoute><Layout><Campaigns /></Layout></PrivateRoute>} />
        <Route path="/campaigns/:id" element={<PrivateRoute><Layout><CampaignDetail /></Layout></PrivateRoute>} />
        <Route path="/copilot" element={<PrivateRoute><Layout><Copilot /></Layout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
        <Route path="/integrations" element={<PrivateRoute><Layout><Integrations /></Layout></PrivateRoute>} />
        <Route path="/architecture" element={<PrivateRoute><Layout><Architecture /></Layout></PrivateRoute>} />

        {/* New enterprise routes */}
        <Route path="/data-quality" element={<PrivateRoute><Layout><DataQuality /></Layout></PrivateRoute>} />
        <Route path="/audit-center" element={<PrivateRoute><Layout><AuditCenter /></Layout></PrivateRoute>} />
        <Route path="/deployment-readiness" element={<PrivateRoute><Layout><DeploymentReadiness /></Layout></PrivateRoute>} />
        <Route path="/customer-success" element={<PrivateRoute><Layout><CustomerSuccess /></Layout></PrivateRoute>} />
        <Route path="/executive-insights" element={<PrivateRoute><Layout><ExecutiveInsights /></Layout></PrivateRoute>} />
        <Route path="/solution-recommendations" element={<PrivateRoute><Layout><SolutionRecommendations /></Layout></PrivateRoute>} />
        <Route path="/implementation-assistant" element={<PrivateRoute><Layout><ImplementationAssistant /></Layout></PrivateRoute>} />
        <Route path="/workflow-builder" element={<PrivateRoute><Layout><WorkflowBuilder /></Layout></PrivateRoute>} />
        <Route path="/implementation-tracker" element={<PrivateRoute><Layout><ImplementationTracker /></Layout></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
