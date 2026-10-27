import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('launcher_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('launcher_token')
      if (token !== 'demo-token') {
        localStorage.removeItem('launcher_token')
        localStorage.removeItem('launcher_user')
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),
}

export const gamesAPI = {
  getAll: () => api.get('/games'),
  getById: (id: string) => api.get(`/games/${id}`),
  getFeatured: () => api.get('/games/featured'),
}

export const shopAPI = {
  getFeatured: () => api.get('/shop/featured'),
  getDaily: () => api.get('/shop/daily'),
  purchase: (itemId: string) => api.post(`/shop/purchase/${itemId}`),
}

export const leaderboardAPI = {
  getGlobal: () => api.get('/leaderboard/global'),
  getByGame: (gameId: string) => api.get(`/leaderboard/${gameId}`),
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/user/profile', data),
  getSettings: () => api.get('/user/settings'),
  updateSettings: (data: Record<string, unknown>) => api.patch('/user/settings', data),
}
