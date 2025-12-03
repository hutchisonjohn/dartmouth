import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dartmouth-os-worker.dartmouth.workers.dev'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const { state } = JSON.parse(token)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch (e) {
      console.error('Error parsing auth token:', e)
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
}

// Tickets API
export const ticketsApi = {
  list: (params?: { status?: string; priority?: string; assignedTo?: string; limit?: number; offset?: number }) =>
    api.get('/api/tickets', { params }),
  get: (id: string) => api.get(`/api/tickets/${id}`),
  getById: (ticketId: string) => api.get(`/api/tickets/${ticketId}`),
  getMessages: (ticketId: string) => api.get(`/api/tickets/${ticketId}/messages`),
  assign: (id: string, assignedTo: string) =>
    api.put(`/api/tickets/${id}/assign`, { assignedTo }),
  updateStatus: (id: string, status: string) =>
    api.put(`/api/tickets/${id}/status`, { status }),
  reply: (id: string, content: string) =>
    api.post(`/api/tickets/${id}/reply`, { content }),
  addNote: (id: string, content: string, noteType?: string) =>
    api.post(`/api/tickets/${id}/notes`, { content, noteType }),
  snooze: (id: string, snoozedUntil: string, reason?: string) =>
    api.post(`/api/tickets/${id}/snooze`, { snoozedUntil, reason }),
  unsnooze: (id: string) => api.post(`/api/tickets/${id}/unsnooze`),
  escalate: (id: string, staffIds: string[], reason: string) =>
    api.post(`/api/tickets/${id}/escalate`, { staffIds, reason }),
  resolveEscalation: (id: string, escalationId: string) =>
    api.post(`/api/tickets/${id}/resolve-escalation`, { escalationId }),
  scheduleReply: (id: string, content: string, scheduledFor: string) =>
    api.post(`/api/tickets/${id}/schedule-reply`, { content, scheduledFor }),
  getScheduledMessages: (id: string) =>
    api.get(`/api/tickets/${id}/scheduled-messages`),
  updateScheduledMessage: (messageId: string, content: string, scheduledFor: string) =>
    api.put(`/api/scheduled-messages/${messageId}`, { content, scheduledFor }),
  deleteScheduledMessage: (messageId: string) =>
    api.delete(`/api/scheduled-messages/${messageId}`),
  getAIDraft: (id: string) =>
    api.get(`/api/tickets/${id}/ai-draft`),
  approveAIDraft: (id: string) =>
    api.post(`/api/tickets/${id}/ai-draft/approve`),
  editAIDraft: (id: string, editedContent: string) =>
    api.post(`/api/tickets/${id}/ai-draft/edit`, { editedContent }),
  rejectAIDraft: (id: string, reason: string) =>
    api.post(`/api/tickets/${id}/ai-draft/reject`, { reason }),
  submitAIDraftFeedback: (id: string, feedback: { qualityScore: number; wasHelpful: boolean; improvementNotes: string; action?: string }) =>
    api.post(`/api/tickets/${id}/ai-draft/feedback`, feedback),
  delete: (id: string) =>
    api.delete(`/api/tickets/${id}`),
  merge: (primaryTicketId: string, secondaryTicketIds: string[]) =>
    api.post(`/api/tickets/${primaryTicketId}/merge`, { secondaryTicketIds }),
  bulkAssign: (ticketIds: string[], assignedTo: string | null) =>
    api.post('/api/tickets/bulk-assign', { ticketIds, assignedTo }),
}

// Mentions API
export const mentionsApi = {
  list: (unreadOnly?: boolean) =>
    api.get('/api/mentions', { params: { unreadOnly } }),
  get: (id: string) => api.get(`/api/mentions/${id}`),
  create: (data: {
    ticketId: string
    toStaffId: string
    message: string
    priority?: string
    type?: string
  }) => api.post('/api/mentions', data),
  reply: (id: string, message: string) =>
    api.post(`/api/mentions/${id}/reply`, { message }),
  markAsRead: (id: string) => api.put(`/api/mentions/${id}/read`),
}

// Staff API
export const staffApi = {
  list: () => api.get('/api/staff'),
  get: (id: string) => api.get(`/api/staff/${id}`),
  me: () => api.get('/api/staff/me'),
  onlineCount: () => api.get('/api/staff/online-count'),
  create: (data: {
    email: string;
    first_name: string;
    last_name?: string;
    role?: string;
    job_title?: string;
    phone?: string;
    department?: string;
    password: string;
  }) => api.post('/api/staff', data),
  update: (id: string, data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    job_title?: string;
    phone?: string;
    department?: string;
    password?: string;
  }) => api.put(`/api/staff/${id}`, data),
  updatePresence: (id: string, isAvailable: boolean) =>
    api.put(`/api/staff/${id}/presence`, { isAvailable }),
  updateAvailability: (id: string, status: 'online' | 'offline' | 'away') =>
    api.put(`/api/staff/${id}/availability`, { status }),
}

// Chat Settings API
export const chatApi = {
  getSettings: () => api.get('/api/chat/settings'),
  updateSettings: (settings: {
    is_enabled?: boolean;
    primary_color?: string;
    secondary_color?: string;
    button_text?: string;
    welcome_message?: string;
    offline_message?: string;
    timezone?: string;
    show_business_hours?: boolean;
    require_email_when_offline?: boolean;
  }) => api.put('/api/chat/settings', settings),
  getBusinessHours: () => api.get('/api/chat/business-hours'),
  updateBusinessHours: (hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
  }>) => api.put('/api/chat/business-hours', { hours }),
  getStatus: () => api.get('/api/chat/status'),
}

// Settings API
export const settingsApi = {
  list: () => api.get('/api/settings'),
  get: (key: string) => api.get(`/api/settings/${key}`),
  update: (key: string, value: string) =>
    api.put(`/api/settings/${key}`, { value }),
}

// Analytics API
export const analyticsApi = {
  getAIAgentStats: (timeRange: string = '7d') =>
    api.get('/api/analytics/ai-agent', { params: { timeRange } }),
  getLearningExamples: (limit: number = 10) =>
    api.get('/api/analytics/ai-agent/learning-examples', { params: { limit } }),
}

