import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

interface Slide {
  adspace?: string
  title: string
  body: string
}

const slides: Slide[] = [
  {
    adspace: 'Launcher',
    title: 'Chapter 1 Season 9',
    body: 'The future arrived on the Island. Neo Tilted, Mega Mall and advanced technology mark the beginning of a new era in Fortnite.',
  },
]

const updates = [
  {
    id: 1,
    version: 'v9.10',
    date: 'May 15, 2026',
    title: 'Patch 9.10 — Proximity Grenade Launcher',
    body: 'The Proximity Grenade Launcher has been unvaulted. Slipstream speed increased by 10%. Bug fixes for Neo Tilted collision.',
    author: 'Launcher Team',
  },
  {
    id: 2,
    version: 'v9.01',
    date: 'May 8, 2026',
    title: 'Patch 9.01 — Balancing Update',
    body: 'Combat Shotgun damage reduced. Drum Gun re-vaulted. Performance improvements across all platforms.',
    author: 'Launcher Team',
  },
  {
    id: 3,
    version: 'v9.00',
    date: 'May 1, 2026',
    title: 'Chapter 1 Season 9 — The Future is Now',
    body: 'Welcome to Season 9. Neo Tilted and Mega Mall replace Tilted Towers and Retail Row. Slipstreams added across the map.',
    author: 'Launcher Team',
  },
]

const newsSlides: Slide[] = [
  {
    adspace: 'Community',
    title: 'Community Spotlight',
    body: 'Top plays and creations from the community this week. Share your clips on Discord to get featured.',
  },
  {
    adspace: 'Item Shop',
    title: 'Item Shop Refresh',
    body: 'New cosmetics rotate daily at 00:00 UTC. Check the Shop tab to see what is available right now.',
  },
  {
    adspace: 'Gameplay',
    title: 'Slipstreams Are Live',
    body: 'Ride the wind tunnels across the map for fast rotations. Slipstream speed was increased in the latest patch.',
  },
]

const updateSlides: Slide[] = updates.map(u => ({
  adspace: 'Latest Updates',
  title: u.title,
  body: u.body,
}))

function ProfileCardsRow() {
  const { user } = useAuth()

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#0d0d0d] border border-white/[0.06] flex-1 min-w-0">
        <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border border-white/10 bg-gradient-to-br from-violet-500 to-purple-800">
          <img
            src="https://fortnite-api.com/images/cosmetics/br/cid_001_athena_commando_f_default/icon.png"
            alt={user?.username ?? 'Profile'}
            className="w-full h-full object-cover"
            draggable={false}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <div className="leading-tight min-w-0">
          <p className="text-[10px] text-zinc-500">Welcome back,</p>
          <p className="text-base font-bold text-white truncate">{user?.username ?? 'Player'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#0d0d0d] border border-white/[0.06]">
        <img src="Icon_VBucks.webp" alt="V-Bucks" className="w-6 h-6 object-contain" draggable={false} />
        <div className="leading-tight">
          <p className="text-[11px] text-zinc-500">V-Bucks</p>
          <p className="text-sm font-bold text-white">{(user?.credits ?? 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

function NewsCarousel({ items, height = 'h-60' }: { items: Slide[]; height?: string }) {
  const [index, setIndex] = useState(0)
  const current = items[index]

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000)
    return () => clearInterval(id)
  }, [items.length])

  return (
    <div className={`relative ${height} rounded-xl overflow-hidden bg-[#0d0d0d] border border-white/[0.06]`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {current.adspace && (
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                {current.adspace}
              </span>
            )}
            <h3 className="text-base font-bold text-white uppercase tracking-wide mt-0.5">
              {current.title}
            </h3>
            <p className="text-xs text-white/50 mt-0.5 line-clamp-2 max-w-md">
              {current.body}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="cursor-pointer rounded-full transition-all duration-200"
              style={{
                width: i === index ? '12px' : '4px',
                height: '4px',
                background: i === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full text-white flex flex-col p-4 pb-0"
    >
      <div className="flex-shrink-0 pb-3">
        <ProfileCardsRow />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        <div className="flex flex-col gap-3 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <NewsCarousel items={slides} />
            <NewsCarousel items={newsSlides} />
          </div>

          <NewsCarousel items={updateSlides} height="h-72" />
        </div>
      </div>
    </motion.div>
  )
}
