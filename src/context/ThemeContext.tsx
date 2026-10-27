import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Theme {
  id: string
  name: string
  bg: string
  accent: string
}

export const THEMES: Theme[] = [
  { id: 'violetlime', name: 'Violet Lime', bg: '#1a0b2e', accent: '#a3e635' },
  { id: 'obsidian',  name: 'Obsidian',  bg: '#0f0f13', accent: '#00b4f0' },
  { id: 'ocean',     name: 'Ocean',     bg: '#001829', accent: '#00b4f0' },
  { id: 'midnight',  name: 'Midnight',  bg: '#000000', accent: '#6366f1' },
  { id: 'slate',     name: 'Slate',     bg: '#0f172a', accent: '#38bdf8' },
  { id: 'forest',    name: 'Forest',    bg: '#0a1a0f', accent: '#22c55e' },
  { id: 'crimson',   name: 'Crimson',   bg: '#1a0a0a', accent: '#ef4444' },
  { id: 'violet',    name: 'Violet',    bg: '#120a1a', accent: '#a855f7' },
  { id: 'amber',     name: 'Amber',     bg: '#1a1200', accent: '#f59e0b' },
]

interface ThemeContextType {
  theme: Theme
  setThemeById: (id: string) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('launcher_theme')
    return THEMES.find(t => t.id === saved) ?? THEMES[0]
  })

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-main', theme.bg)
    document.documentElement.style.setProperty('--accent', theme.accent)
    localStorage.setItem('launcher_theme', theme.id)
  }, [theme])

  const setThemeById = (id: string) => {
    const found = THEMES.find(t => t.id === id)
    if (found) setTheme(found)
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeById }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
