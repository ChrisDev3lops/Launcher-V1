import { useState, useEffect, useCallback } from 'react'

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  section: 'featured' | 'daily'
  type: { value: string; displayValue: string }
  rarity: { value: string; displayValue: string }
  images: { smallIcon?: string; icon?: string; featured?: string }
}

const CATALOG_URL = 'http://26.87.221.115:3551/fortnite/api/storefront/v2/catalog'

export function useShopItems() {
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchShop = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(CATALOG_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      const daily: any[] = json.storefronts?.find((s: any) => s.name === 'BRDailyStorefront')?.catalogEntries ?? []
      const weekly: any[] = json.storefronts?.find((s: any) => s.name === 'BRWeeklyStorefront')?.catalogEntries ?? []
      const rawEntries = [...weekly, ...daily]
      if (rawEntries.length === 0) throw new Error('Empty shop response')

      const loaded = (await Promise.all(
        rawEntries.map(async (entry: any): Promise<ShopItem | null> => {
          try {
            const price = entry.prices?.[0]?.finalPrice ?? 0
            const id = entry.itemGrants?.[0]?.templateId?.split(':')[1]
            if (!id) return null

            const r = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`)
            if (!r.ok) return null
            const data = await r.json()
            if (data.status !== 200 || !data.data) return null

            return {
              id: data.data.id,
              name: data.data.name,
              description: data.data.description ?? '',
              price,
              section: entry.catalogGroup?.includes('Weekly') ? 'featured' : 'daily',
              type: { value: data.data.type?.value ?? '', displayValue: data.data.type?.displayValue ?? '' },
              rarity: { value: data.data.rarity?.value ?? 'common', displayValue: data.data.rarity?.displayValue ?? 'Common' },
              images: data.data.images ?? {},
            }
          } catch {
            return null
          }
        })
      )).filter(Boolean) as ShopItem[]

      setItems(loaded)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchShop() }, [fetchShop])

  return { items, loading, error, refresh: fetchShop }
}

export function getRarityGradient(rarity: string) {
  switch (rarity.toLowerCase()) {
    case 'common':        return 'from-zinc-500 via-zinc-600 to-zinc-700'
    case 'uncommon':      return 'from-lime-500 via-lime-600 to-lime-700'
    case 'rare':          return 'from-sky-500 via-sky-600 to-sky-700'
    case 'epic':          return 'from-purple-500 via-purple-600 to-purple-700'
    case 'legendary':     return 'from-orange-500 via-orange-600 to-orange-700'
    case 'mythic':        return 'from-yellow-400 via-yellow-500 to-yellow-600'
    case 'marvel':        return 'from-red-600 via-red-700 to-red-800'
    case 'dc':            return 'from-blue-600 via-blue-700 to-blue-800'
    case 'icon series':   return 'from-cyan-500 via-cyan-600 to-cyan-700'
    case 'star wars':     return 'from-slate-700 via-slate-800 to-slate-900'
    case 'gaminglegends': return 'from-cyan-500 via-cyan-600 to-cyan-700'
    default:              return 'from-neutral-600 via-neutral-700 to-neutral-800'
  }
}
