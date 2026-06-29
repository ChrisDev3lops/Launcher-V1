import { useAuth } from '../context/AuthContext'
import { Megaphone } from 'lucide-react'

const updates = [
  {
    id: 1,
    version: 'v9.10',
    date: 'May 15, 2026',
    title: 'Patch 9.10 — Proximity Grenade Launcher',
    body: 'The Proximity Grenade Launcher has been unvaulted. Slipstream speed increased by 10%. Bug fixes for Neo Tilted collision.',
    tag: 'Patch Notes',
    tagColor: 'bg-ironmp500/20 text-ironmp400 border-ironmp500/20',
  },
  {
    id: 2,
    version: 'v9.01',
    date: 'May 8, 2026',
    title: 'Patch 9.01 — Balancing Update',
    body: 'Combat Shotgun damage reduced. Drum Gun re-vaulted. Performance improvements across all platforms.',
    tag: 'Balance',
    tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  },
  {
    id: 3,
    version: 'v9.00',
    date: 'May 1, 2026',
    title: 'Chapter 1 Season 9 — The Future is Now',
    body: 'Welcome to Season 9. Neo Tilted and Mega Mall replace Tilted Towers and Retail Row. Slipstreams added across the map.',
    tag: 'Season Launch',
    tagColor: 'bg-green-500/20 text-green-400 border-green-500/20',
  },
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="h-full overflow-y-auto">
      {/* Welcome header */}
      <div className="px-8 pt-7 pb-5 fade-in-up">
        <div className="flex items-center justify-between">
          {/* Left — greeting */}
          <div>
            <p className="text-white/40 text-xs font-medium tracking-wide uppercase">Welcome back</p>
            <h1 className="text-xl font-black text-white leading-tight">
              {user?.username ?? 'Player'}
            </h1>
          </div>

          {/* Right — credits badge */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5">
            <img src="Icon_VBucks.webp" alt="V-Bucks" className="w-5 h-5 object-contain" onError={() => {}} />
            <span className="text-white font-bold text-sm">{(user?.credits ?? 10000).toLocaleString()}</span>
            <span className="text-white/30 text-xs">V-Bucks</span>
          </div>
        </div>
      </div>

      {/* Featured banner — full width, no side padding */}
      <div
        className="relative w-full overflow-hidden fade-in-up"
        style={{ aspectRatio: '21/8', animationDelay: '0.1s' }}
      >
        <img
          src="6900d36fcf71b.webp"
          alt="Chapter 1 Season 9"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Text */}
        <div className="absolute bottom-0 left-0 px-8 pb-7">
          <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1">
            Featured
          </p>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
            Chapter 1 Season 9
          </h2>
          <p className="text-white/60 text-sm max-w-lg leading-relaxed">
            The future arrived on the Island. Neo Tilted, Mega Mall and advanced
            technology mark the beginning of a new era in Fortnite.
          </p>
        </div>
      </div>

      {/* Updates section — padded */}
      <div className="px-8 pt-6 pb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-ironmp400" />
            <h2 className="text-white font-bold text-base">Updates</h2>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-3 stagger">
          {updates.map((u) => (
            <div
              key={u.id}
              className="bg-white/4 border border-white/6 rounded-2xl p-4 transition-all duration-300 cursor-pointer group hover:bg-white/7 hover:border-ironmp-500/30 hover:scale-[1.04] hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,180,240,0.15)]"
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${u.tagColor}`}>
                  {u.tag}
                </span>
                <span className="text-white/25 text-xs font-mono">{u.version}</span>
              </div>

              {/* Title */}
              <p className="text-white font-bold text-sm leading-snug mb-2 group-hover:text-ironmp300 transition-colors">
                {u.title}
              </p>

              {/* Body */}
              <p className="text-white/40 text-xs leading-relaxed line-clamp-3">
                {u.body}
              </p>

              {/* Date */}
              <p className="text-white/20 text-xs mt-3">{u.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
