import { useState, useEffect } from 'react'
import { Clock, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const rarityColor: Record<string, string> = {
  common:        '#6b7280',
  uncommon:      '#22c55e',
  rare:          '#3b82f6',
  epic:          '#a855f7',
  legendary:     '#f59e0b',
  mythic:        '#ef4444',
  gaminglegends: '#1d4ed8',
  slurp:         '#06b6d4',
  marvel:        '#dc2626',
  dc:            '#1e3a5f',
  starwars:      '#fbbf24',
  icon:          '#0ea5e9',
  shadow:        '#374151',
  frozen:        '#bfdbfe',
  lava:          '#f97316',
  dark:          '#7c3aed',
}

interface ShopEntry {
  offerId: string
  devName: string
  regularPrice: number
  finalPrice: number
  bundle?: { name: string; info: string; image: string }
  banner?: { value: string; intensity: string; backendValue: string }
  giftable: boolean
  refundable: boolean
  categories: string[]
  sectionId: string
  section: { id: string; name: string; index: number; landingPriority: number; sortOffersByPrice: boolean }
  sortPriority: number
  catalogGroupPriority: number
  dailyLimit: number
  weeklyLimit: number
  monthlyLimit: number
  offerTag: string
  items: ShopItem[]
}

interface ShopItem {
  id: string
  name: string
  description: string
  type: { value: string; displayValue: string; backendValue: string }
  rarity: { value: string; displayValue: string; backendValue: string }
  series?: { value: string; image: string; colors: string[]; backendValue: string }
  set?: { value: string; text: string; backendValue: string }
  introduction?: { chapter: string; season: string; text: string; backendValue: number }
  images: { smallIcon: string; icon: string; featured?: string; other?: Record<string, string> }
  variants: unknown[]
  searchTags: string[]
  gameplayTags: string[]
  metaTags: string[]
  showcaseVideo?: string
  dynamicPakId?: string
  displayAssetPath?: string
  definitionPath?: string
  path: string
  added: string
  shopHistory: string[]
}

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
  const [entries, setEntries] = useState<ShopEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
const [closing, setClosing] = useState(false)

const closeModal = () => {
  setClosing(true)

  setTimeout(() => {
    setSelectedItem(null)
    setClosing(false)
  }, 250)
}

const fetchShop = async () => {
  setLoading(true)
  setError('')
  try {
    const res = await fetch('http://26.87.221.115:3551/fortnite/api/storefront/v2/catalog')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    // Parse the raw Epic Games storefront format
    const daily: any[]  = json.storefronts?.find((s: any) => s.name === 'BRDailyStorefront')?.catalogEntries ?? []
    const weekly: any[] = json.storefronts?.find((s: any) => s.name === 'BRWeeklyStorefront')?.catalogEntries ?? []

    const rawEntries = [...weekly, ...daily]
    if (rawEntries.length === 0) throw new Error('Empty shop response')

    // Fetch cosmetic details for each entry from fortnite-api.com
    const entries = (await Promise.all(
      rawEntries.map(async (entry: any) => {
        try {
          const price = entry.prices?.[0]?.finalPrice ?? 0
          const id = entry.itemGrants?.[0]?.templateId?.split(':')[1]
          if (!id) return null

          const r = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`)
          if (!r.ok) return null
          const data = await r.json()
          if (data.status !== 200 || !data.data) return null

          return {
            offerId: entry.offerId ?? id,
            devName: data.data.name,
            regularPrice: price,
            finalPrice: price,
            giftable: true,
            refundable: false,
            categories: [],
            sectionId: entry.catalogGroup ?? 'daily',
            section: {
              id: entry.catalogGroup ?? 'daily',
              name: entry.catalogGroup?.includes('Weekly') ? 'Featured' : 'Daily',
              index: 0,
              landingPriority: entry.catalogGroup?.includes('Weekly') ? 1 : 0,
              sortOffersByPrice: false,
            },
            sortPriority: entry.catalogGroup?.includes('Weekly') ? 1 : 0,
            catalogGroupPriority: 0,
            dailyLimit: -1,
            weeklyLimit: -1,
            monthlyLimit: -1,
            offerTag: '',
            items: [{
              id: data.data.id,
              name: data.data.name,
              description: data.data.description ?? '',
              type: data.data.type,
              rarity: data.data.rarity,
              images: data.data.images,
              variants: data.data.variants ?? [],
              searchTags: [],
              gameplayTags: [],
              metaTags: [],
              path: '',
              added: '',
              shopHistory: [],
            }],
          } as ShopEntry
        } catch {
          return null
        }
      })
    )).filter(Boolean) as ShopEntry[]

    setEntries(entries)
  } catch (err) {
    console.error('Shop fetch error:', err)
    setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    setEntries([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => { fetchShop() }, [])


  const featured = entries.filter(e =>
    e.section?.name?.toLowerCase().includes('featured') ||
    e.sectionId?.toLowerCase().includes('featured') ||
    e.sortPriority > 0
  ).slice(0, 4)

  const daily = entries.filter(e => !featured.includes(e)).slice(0, 9)

  return (
    <div className="h-full overflow-y-auto page-container page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">ITEM SHOP</h1>
          <p className="text-white/40 text-sm">View the latest cosmetics in the Item Shop!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <img src="Icon_VBucks.webp" alt="VBucks" className="w-4 h-4 object-contain" />
            <span className="text-white font-bold">{(user?.credits ?? 10000).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-white font-mono font-bold">{countdown}</span>
          </div>
          <button
            onClick={fetchShop}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-white/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
              <p className="section-title">Featured</p>
              <div className="grid grid-cols-2 gap-4 stagger">
                {featured.map((entry) => (
                  <ShopCard
  key={entry.offerId}
  entry={entry}
  large
  onClick={() => setSelectedItem(entry.items[0])}
/>
                ))}
              </div>
            </div>
          )}

          {daily.length > 0 && (
            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <p className="section-title">Daily</p>
              <div className="grid grid-cols-3 gap-4 stagger">
                {daily.map((entry) => (
                  <ShopCard
  key={entry.offerId}
  entry={entry}
  onClick={() => setSelectedItem(entry.items[0])}
/>
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-white/30 text-sm">No items in the shop right now.</p>
            </div>
          )}
          {selectedItem && (
<div
className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
  closing ? 'opacity-0' : 'opacity-100'
}`}
  onClick={() => closeModal()}
>
<div
className={`bg-[#111318] border border-white/10 rounded-3xl overflow-hidden w-[650px] max-w-[95vw] ${
  closing ? 'modal-out' : 'scale-in'
}`}
  onClick={(e) => e.stopPropagation()}
>
      <img
        src={
          selectedItem.images.featured ||
          selectedItem.images.icon ||
          selectedItem.images.smallIcon
        }
        alt={selectedItem.name}
        className="w-full h-80 object-contain bg-gradient-to-b from-white/5 to-transparent"
      />

      <div className="p-6">
        <h2 className="text-3xl font-black text-white mb-2">
          {selectedItem.name}
        </h2>

        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm">
            {selectedItem.rarity?.displayValue}
          </span>

          <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm">
            {selectedItem.type?.displayValue}
          </span>
        </div>

        <p className="text-white/70 mb-6">
          {selectedItem.description || 'No description available.'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() =>
              window.open(
                `https://fortnite.gg/cosmetics?id=${selectedItem.id}`,
                '_blank'
              )
            }
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold transition-all duration-300 hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] active:scale-95"  
          >
            View on Fortnite.GG
          </button>

          <button
            onClick={() => closeModal()}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
        </>
      )}
    </div>
  )
}

function ShopCard({
  entry,
  large = false,
  onClick
}: {
  entry: ShopEntry
  large?: boolean
  onClick?: () => void
}) {
  const item = entry.items?.[0]
  if (!item) return null

  const rarity       = item.rarity?.value?.toLowerCase() ?? 'common'
  const accentColor  = rarityColor[rarity] ?? '#6b7280'
  const image        = item.images?.featured ?? item.images?.icon ?? item.images?.smallIcon ?? ''
  const name         = entry.bundle?.name ?? item.name
  const price        = entry.finalPrice ?? entry.regularPrice

  return (
<div
  onClick={onClick}
  className={`relative rounded-2xl overflow-hidden border border-white/5 cursor-pointer group transition-all duration-300 hover:border-white/20 hover:scale-[1.03] hover:shadow-2xl ${large ? 'h-64' : 'h-44'}`}
  style={{ background: `linear-gradient(135deg, ${accentColor}33 0%, #0a0a0d 100%)` }}
>
      {image && (
        <img
          src={image}
          alt={name}
          className="absolute right-0 top-0 object-contain pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:translate-x-1"
          style={{ maxWidth: '60%', height: '100%' }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div
        className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: accentColor + 'cc' }}
      >
        {item.rarity?.displayValue ?? rarity}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className={`text-white font-black uppercase tracking-tight mb-0.5 ${large ? 'text-xl' : 'text-sm'}`}>
          {name}
        </h3>
        {large && item.description && (
          <p className="text-white/50 text-xs mb-2 line-clamp-1">{item.description}</p>
        )}
        <div className="flex items-center gap-1.5">
          <img src="Icon_VBucks.webp" alt="V-Bucks" className="w-3.5 h-3.5 object-contain" />
          <span className="text-white font-bold text-sm">{price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}