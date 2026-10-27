import { useState } from 'react'
import { Info, Palette } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES, Theme } from '../context/ThemeContext'

type Tab = 'about' | 'themes'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2 px-1">
        {title}
      </p>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#111' }}
      >
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, right, last = false }: {
  label: string
  value?: string
  right?: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${!last ? 'border-b' : ''}`}
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <p className="text-sm font-medium text-white/90">{label}</p>
      {right ?? <p className="text-sm text-white/40">{value}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setThemeById } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('themes')

  const tabs = [
    { id: 'themes' as Tab, label: 'Themes', icon: Palette },
    { id: 'about' as Tab,  label: 'About',  icon: Info },
  ]

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-48 border-r border-white/[0.05] p-3 flex flex-col">
        <nav className="space-y-0.5 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === id
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
        <div className="pt-3 border-t border-white/[0.05] px-1">
          <p className="text-white/20 text-[10px]">launcher/stable</p>
          <p className="text-white/20 text-[10px]">v1.0.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'themes' && (
          <div className="max-w-lg">
            <h1 className="text-xl font-bold text-white tracking-tight mb-1">Themes</h1>
            <p className="text-zinc-600 text-xs mb-5">Choose a background color for the launcher.</p>

            <Section title="Background">
              <div className="grid grid-cols-4 gap-3 p-4">
                {THEMES.map((t) => (
                  <ThemeButton key={t.id} t={t} active={theme.id === t.id} onSelect={() => setThemeById(t.id)} />
                ))}
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-lg">
            <h1 className="text-xl font-bold text-white tracking-tight mb-5">About</h1>

            <Section title="Application">
              <Row label="Name" value="Launcher" />
              <Row label="Version" value="1.0.0" />
              <Row label="Build" value="stable" />
              <Row label="Tauri" value="2.x" last />
            </Section>

            <Section title="Account">
              <Row label="Email" value={user?.email ?? '—'} />
              <Row label="User ID" value={user?.id ?? '—'} last />
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

function ThemeButton({ t, active, onSelect }: { t: Theme; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
        active ? 'border-white/25 bg-white/[0.06]' : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03]'
      }`}
    >
      <div
        className="w-12 h-12 rounded-full transition-all duration-150"
        style={{
          backgroundColor: t.bg,
          border: active ? `2px solid ${t.accent}` : '2px solid rgba(255,255,255,0.1)',
          boxShadow: active ? `0 0 14px ${t.accent}44` : 'none',
        }}
      />
      <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-white' : 'text-zinc-600'}`}>
        {t.name}
      </span>
    </button>
  )
}
