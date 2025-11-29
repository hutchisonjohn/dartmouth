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
  updatePresence: (id: string, isAvailable: boolean) =>
    api.put(`/api/staff/${id}/presence`, { isAvailable }),
}

// Settings API
export const settingsApi = {
  list: () => api.get('/api/settings'),
  get: (key: string) => api.get(`/api/settings/${key}`),
  update: (key: string, value: string) =>
    api.put(`/api/settings/${key}`, { value }),
}


