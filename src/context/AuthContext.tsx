import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getUser, setUser, getToken, setToken, clearAuth } from '../lib/auth'
import { authAPI } from '../lib/api'

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    const savedUser = getUser()
    if (token && savedUser) {
      setUserState(savedUser)
      // Skip backend validation for demo token
      if (token === 'demo-token') {
        setIsLoading(false)
        return
      }
      // Validate token with backend
      authAPI.me()
        .then((res) => {
          setUserState(res.data.user)
          setUser(res.data.user)
        })
        .catch(() => {
          clearAuth()
          setUserState(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password)
    const { token, user: userData } = res.data
    setToken(token)
    setUser(userData)
    setUserState(userData)
  }

  const logout = () => {
    clearAuth()
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
