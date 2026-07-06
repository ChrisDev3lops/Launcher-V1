import { useState, useEffect } from 'react'
import { Plus, Trash2, Play, FolderOpen } from 'lucide-react'
import { tauriAPI } from '../lib/tauri'

interface Build {
  id: string
  name: string
  folder: string
  exePath: string
  dllPath?: string
  backendUrl?: string
}

const STORAGE_KEY = 'water_builds'

function loadBuilds(): Build[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveBuilds(builds: Build[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds))
}

export default function LibraryPage() {
  const [builds, setBuilds] = useState<Build[]>(loadBuilds)
  const [launching, setLaunching] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { saveBuilds(builds) }, [builds])

  const handleAdd = async () => {
    setError('')
    const result = await tauriAPI.selectFortniteFolder()
    if (!result) return
    if (!result.exePath) {
      setError('FortniteClient-Win64-Shipping.exe not found in the selected folder.')
      return
    }
    const name = result.folder.split('\\').pop() || 'Fortnite'
    setBuilds(prev => [...prev, { id: Date.now().toString(), name, folder: result.folder, exePath: result.exePath! }])
  }

  const handleDelete = (id: string) => {
    setBuilds(prev => prev.filter(b => b.id !== id))
  }

  const handleLaunch = async (build: Build) => {
    setLaunching(build.id)
    setError('')
    const res = await tauriAPI.launchGame({ exePath: build.exePath, dllPath: build.dllPath, backendUrl: build.backendUrl })
    setLaunching(null)
    if (res && !res.success) setError(res.error || 'Failed to launch.')
  }

  return (
    <div className="h-full overflow-y-auto page-container page-enter">
      <div className="mb-8 fade-in-up">
        <h1 className="text-3xl font-black text-white mb-1">Library</h1>
        <p className="text-white/40 text-sm">Manage and launch your Fortnite builds.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm scale-in">
          {error}
        </div>
      )}

      {builds.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 text-center fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-white/20" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">No Builds</h2>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            Click the <strong className="text-white/70">+</strong> button to add your Fortnite build folder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 stagger">
          {builds.map((build) => (
            <BuildCard
              key={build.id}
              build={build}
              launching={launching === build.id}
              onLaunch={() => handleLaunch(build)}
              onDelete={() => handleDelete(build.id)}
            />
          ))}
        </div>
      )}

      {/* Add FAB */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleAdd}
          title="Add build"
          className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-ironmp-500 hover:bg-ironmp-400 flex items-center justify-center text-white transition-all shadow-xl hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function BuildCard({ build, launching, onLaunch, onDelete }: {
  build: Build
  launching: boolean
  onLaunch: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
    }
  }

  return (
    <div className="group rounded-2xl overflow-hidden border border-white/8 bg-white/3 hover:border-white/15 transition-all duration-300">
      {/* Image area */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/7' }}>
        <img
          src="6900d36fcf71b.webp"
          alt={build.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Delete button — top right */}
        <button
          onClick={handleDeleteClick}
          title={confirmDelete ? 'Click again to confirm' : 'Delete build'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
            confirmDelete
              ? 'bg-red-500 text-white scale-110'
              : 'bg-black/50 text-white/40 hover:bg-red-500/80 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">{build.name}</p>
          <p className="text-white/30 text-xs truncate max-w-[200px]">{build.folder}</p>
        </div>

        {/* Play button */}
        <button
          onClick={(e) => { e.stopPropagation(); onLaunch() }}
          disabled={launching}
          className="flex-shrink-0 ml-3 flex items-center gap-2 bg-ironmp-500 hover:bg-ironmp-400 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {launching ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
          {launching ? 'Launching...' : 'Play'}
        </button>
      </div>
    </div>
  )
}
