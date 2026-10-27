import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import TitleBar from '../components/layout/TitleBar'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setLoading(true)
    const mockUser = { id: '1', username: 'demo', email: 'demo@example.com', credits: 10000, role: 'user', avatar: undefined }
    localStorage.setItem('launcher_token', 'demo-token')
    localStorage.setItem('launcher_user', JSON.stringify(mockUser))
    window.location.reload()
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#050505]">
      <div className="absolute inset-0">
        <img
          src="6900d36fcf71b.webp"
          alt="bg"
          className="w-full h-full object-cover scale-105"
          style={{ filter: 'brightness(0.4)' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      <div className="relative z-20">
        <TitleBar />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="glass-dark rounded-2xl overflow-hidden" style={{ boxShadow: '0 28px 70px rgba(0,0,0,0.65)' }}>
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />

            <div className="px-9 pt-9 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-white/40 uppercase mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="input-field"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-white/40 uppercase mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="input-field pr-12"
                      autoComplete="current-password"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-xs">{error}</div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-white hover:bg-white/90 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-all duration-200 text-sm mt-1">
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />Signing in...</span>
                    : 'Sign In'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/20 text-[10px]">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button onClick={handleDemoLogin} disabled={loading}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm">
                Continue as Guest
              </button>
            </div>
          </div>

          <p className="text-center text-white/20 text-[10px] mt-5">Launcher v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
