import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import TitleBar from '../components/layout/TitleBar'
import SnowEffect from '../components/SnowEffect'

// OG skins shown in the background
const BG_SKINS = [
  'https://fortnite-api.com/images/cosmetics/br/cid_030_athena_commando_m_halloween/featured.png',
  'https://fortnite-api.com/images/cosmetics/br/cid_029_athena_commando_f_halloween/featured.png',
  'https://fortnite-api.com/images/cosmetics/br/cid_035_athena_commando_m_medieval/featured.png',
  'https://fortnite-api.com/images/cosmetics/br/cid_280_athena_commando_m_drift/featured.png',
]

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
    const mockUser = { id: '1', username: 'ironmp user', email: 'demo@water.gg', credits: 10000, role: 'user', avatar: undefined }
    localStorage.setItem('water_token', 'demo-token')
    localStorage.setItem('water_user', JSON.stringify(mockUser))
    window.location.reload()
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#06080f]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src="6900d36fcf71b.webp" alt="bg" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      {/* Skins on the sides */}
      <div className="absolute inset-0 flex items-end justify-between pointer-events-none z-[5]">
        {/* Left skins */}
        <div className="flex items-end">
          {BG_SKINS.slice(0, 2).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-[72%] object-contain opacity-70 drop-shadow-2xl"
              style={{
                marginLeft: i === 0 ? '-40px' : '-60px',
                filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.8))',
                animation: `float ${5 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ))}
        </div>
        {/* Right skins */}
        <div className="flex items-end">
          {BG_SKINS.slice(2).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-[72%] object-contain opacity-70 drop-shadow-2xl"
              style={{
                marginRight: i === BG_SKINS.slice(2).length - 1 ? '-40px' : '-60px',
                filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.8))',
                animation: `float ${6 + i}s ease-in-out infinite`,
                animationDelay: `${i * 1.2}s`,
              }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ))}
        </div>
      </div>

      {/* Snow */}
      <SnowEffect />

      {/* Title bar */}
      <div className="relative z-20">
        <TitleBar transparent />
      </div>

      {/* Form */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="aaecc863-a686-4d4e-bd97-14dea0403af7.ico"
              alt="water"
              className="w-14 h-14 object-contain mb-3 drop-shadow-2xl"
            />
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
              water
            </h1>
          </div>

          {/* Card */}
          <div className="glass-dark rounded-2xl p-7 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2">Email</label>
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
                <label className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2">Password</label>
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
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-ironmp-500 hover:bg-ironmp-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wider uppercase mt-1">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span>
                  : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button onClick={handleDemoLogin} disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm">
              Continue as Guest (Demo)
            </button>
          </div>

          <p className="text-center text-white/20 text-xs mt-5">ironmp Launcher v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
