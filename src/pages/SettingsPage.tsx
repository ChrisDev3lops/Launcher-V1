import { useState } from 'react'
import { Info, Palette } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES } from '../context/ThemeContext'

type Tab = 'about' | 'themes'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setThemeById } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('themes')

  const tabs = [
    { id: 'about' as Tab,  label: 'About',  icon: Info },
    { id: 'themes' as Tab, label: 'Themes', icon: Palette },
  ]

  // Split 8 themes into 2 rows of 4
  const row1 = THEMES.slice(0, 4)
  const row2 = THEMES.slice(4, 8)

  return (
    <div className="h-full flex overflow-hidden">
      {/* Settings sidebar */}
      <div className="w-52 border-r border-white/5 p-4 flex flex-col">
        <nav className="space-y-1 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-white/5">
          <p className="text-white/20 text-xs">water/stable</p>
          <p className="text-white/20 text-xs">v1.0.0</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 page-enter">
        {activeTab === 'about' && (
          <div className="max-w-lg fade-in-up">
            <h2 className="text-xl font-bold text-white mb-6">About</h2>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3 stagger">
              <Row label="Application" value="ironmp Launcher" />
              <Row label="Version"     value="1.0.0" />
              <Row label="Build"       value="stable" />
              <Row label="Tauri"       value="2.x" />
              <Row label="Account"     value={user?.email ?? '—'} />
              <Row label="User ID"     value={user?.id ?? '—'} />
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="max-w-lg fade-in-up">
            <h2 className="text-xl font-bold text-white mb-2">Themes</h2>
            <p className="text-white/40 text-sm mb-6">Choose a background color for the launcher.</p>

            {/* Row 1 */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              {row1.map(t => (
                <ThemeButton key={t.id} t={t} active={theme.id === t.id} onSelect={() => setThemeById(t.id)} />
              ))}
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-4 gap-3">
              {row2.map(t => (
                <ThemeButton key={t.id} t={t} active={theme.id === t.id} onSelect={() => setThemeById(t.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ThemeButton({ t, active, onSelect }: { t: { id: string; name: string; bg: string; accent: string }; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${
        active ? 'border-white/30 scale-105 bg-white/5' : 'border-white/5 hover:border-white/15 hover:bg-white/3'
      }`}
    >
      {/* Solid color circle — no inner dot */}
      <div
        className="w-14 h-14 rounded-full transition-all duration-200"
        style={{
          backgroundColor: t.bg,
          border: active ? `2px solid ${t.accent}` : '2px solid rgba(255,255,255,0.08)',
          boxShadow: active ? `0 0 18px ${t.accent}66` : 'none',
        }}
      />
      <span className={`text-xs font-semibold transition-colors ${active ? 'text-white' : 'text-white/40'}`}>
        {t.name}
      </span>
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  )
}
