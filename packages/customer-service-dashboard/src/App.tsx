import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import TicketsPage from './pages/TicketsPage'
import TicketDetailPage from './pages/TicketDetailPage'
import MentionsPage from './pages/MentionsPage'
import SettingsPage from './pages/SettingsPage'
import AIAgentAnalyticsPage from './pages/AIAgentAnalyticsPage'
import BusinessHoursPage from './pages/BusinessHoursPage'
import ChatWidgetSettingsPage from './pages/ChatWidgetSettingsPage'
import StaffPage from './pages/StaffPage'
import StaffPerformancePage from './pages/StaffPerformancePage'
import ChatDashboardPage from './pages/ChatDashboardPage'
import ChatEmbedCodePage from './pages/ChatEmbedCodePage'
import AIAgentWidgetPage from './pages/AIAgentWidgetPage'
import AIAgentKnowledgePage from './pages/AIAgentKnowledgePage'
import AIAgentSystemMessagePage from './pages/AIAgentSystemMessagePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/tickets" replace />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="mentions" element={<MentionsPage />} />
          <Route path="analytics/ai-agent" element={<AIAgentAnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/business-hours" element={<BusinessHoursPage />} />
          <Route path="settings/chat-widget" element={<ChatWidgetSettingsPage />} />
          <Route path="settings/chat-embed" element={<ChatEmbedCodePage />} />
          {/* AI Agent routes */}
          <Route path="ai-agent/widget" element={<AIAgentWidgetPage />} />
          <Route path="ai-agent/knowledge" element={<AIAgentKnowledgePage />} />
          <Route path="ai-agent/system-message" element={<AIAgentSystemMessagePage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="staff/performance" element={<StaffPerformancePage />} />
          <Route path="chat" element={<ChatDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App


