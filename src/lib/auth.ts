export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  credits: number
  role: string
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem('water_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setUser(user: User) {
  localStorage.setItem('water_user', JSON.stringify(user))
}

export function getToken(): string | null {
  return localStorage.getItem('water_token')
}

export function setToken(token: string) {
  localStorage.setItem('water_token', token)
}

export function clearAuth() {
  localStorage.removeItem('water_token')
  localStorage.removeItem('water_user')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
