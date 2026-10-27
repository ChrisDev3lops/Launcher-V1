import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useShopItems, getRarityGradient, ShopItem } from '../hooks/useShopItems'

function useCountdown() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    const reset = new Date()
    reset.setUTCHours(0, 0, 0, 0)
    reset.setUTCDate(reset.getUTCDate() + 1)
    return Math.floor((reset.getTime() - now.getTime()) / 1000)
  })
  useEffect(() => {
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(iv)
  }, [])
  const h = Math.floor(time / 3600)
  const m = Math.floor((time % 3600) / 60)
  const s = time % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ShopPage() {
  const { user } = useAuth()
  const countdown = useCountdown()
  const { items, loading, error, refresh } = useShopItems()
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)

  const featured = items.filter(i => i.section === 'featured').slice(0, 4)
  const daily = items.filter(i => i.section !== 'featured').slice(0, 9)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.05]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Item Shop</h1>
          <p className="text-zinc-600 text-xs mt-0.5">View the latest cosmetics in the Item Shop</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d0d0d] border border-white/[0.06]">
            <img src="Icon_VBucks.webp" alt="VBucks" className="w-3.5 h-3.5 object-contain" />
            <span className="text-white text-xs font-bold">{(user?.credits ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d0d0d] border border-white/[0.06]">
            <Clock size={12} className="text-zinc-500" />
            <span className="text-white text-xs font-mono font-bold">{countdown}</span>
          </div>
          <button
            onClick={refresh}
            className="p-2 rounded-lg bg-[#262626] hover:bg-[#333] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3 px-1">Featured</p>
                <div className="grid grid-cols-2 gap-4">
                  {featured.map((item) => (
                    <ShopCard key={item.id} item={item} large onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </div>
            )}

            {daily.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3 px-1">Daily</p>
                <div className="grid grid-cols-3 gap-4">
                  {daily.map((item) => (
                    <ShopCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-zinc-600 text-sm">No items in the shop right now.</p>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden w-[560px] max-w-[95vw]"
            >
              <div className={`relative h-64 bg-gradient-to-br ${getRarityGradient(selectedItem.rarity.value)} flex items-center justify-center`}>
                <img
                  src={selectedItem.images.featured || selectedItem.images.icon || selectedItem.images.smallIcon}
                  alt={selectedItem.name}
                  className="max-h-full max-w-[70%] object-contain drop-shadow-2xl"
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">{selectedItem.name}</h2>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.07] text-white/60 text-[10px] font-bold uppercase tracking-wider">
                    {selectedItem.rarity.displayValue}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.07] text-white/60 text-[10px] font-bold uppercase tracking-wider">
                    {selectedItem.type.displayValue}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.07] text-white/60 text-[10px] font-bold flex items-center gap-1.5">
                    <img src="Icon_VBucks.webp" className="w-3 h-3" draggable={false} />
                    {selectedItem.price.toLocaleString()}
                  </span>
                </div>

                <p className="text-white/40 text-xs leading-relaxed mb-6">
                  {selectedItem.description || 'No description available.'}
                </p>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => window.open(`https://fortnite.gg/cosmetics?id=${selectedItem.id}`, '_blank')}
                    className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold transition-all hover:bg-white/90"
                  >
                    View on Fortnite.GG
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333] text-white text-sm font-semibold border border-white/10 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ShopCard({ item, large = false, onClick }: {
  item: ShopItem
  large?: boolean
  onClick?: () => void
}) {
  const image = item.images.featured || item.images.icon || item.images.smallIcon

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border border-white/[0.06] cursor-pointer group transition-all duration-200 hover:border-white/20 ${large ? 'h-56' : 'h-44'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(item.rarity.value)}`} style={{ filter: 'brightness(0.75)' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {image && (
        <img
          src={image}
          alt={item.name}
          className="absolute inset-0 m-auto object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ maxWidth: '75%', maxHeight: '70%' }}
          draggable={false}
        />
      )}

      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-white/80 bg-black/50 backdrop-blur-sm">
        {item.rarity.displayValue}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <h3 className={`text-white font-bold uppercase tracking-wide mb-0.5 drop-shadow-md ${large ? 'text-base' : 'text-xs'}`}>
          {item.name}
        </h3>
        {large && item.description && (
          <p className="text-white/50 text-[10px] mb-1.5 line-clamp-1">{item.description}</p>
        )}
        <div className="flex items-center gap-1.5">
          <img src="Icon_VBucks.webp" alt="V-Bucks" className="w-3.5 h-3.5 object-contain" draggable={false} />
          <span className="text-white font-bold text-xs">{item.price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
