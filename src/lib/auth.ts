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
    const raw = localStorage.getItem('launcher_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setUser(user: User) {
  localStorage.setItem('launcher_user', JSON.stringify(user))
}

export function getToken(): string | null {
  return localStorage.getItem('launcher_token')
}

export function setToken(token: string) {
  localStorage.setItem('launcher_token', token)
}

export function clearAuth() {
  localStorage.removeItem('launcher_token')
  localStorage.removeItem('launcher_user')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
