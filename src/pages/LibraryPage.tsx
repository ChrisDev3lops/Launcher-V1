import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Play, FolderOpen, MoreVertical, Loader2, AlertTriangle } from 'lucide-react'
import { open } from '@tauri-apps/plugin-shell'
import { tauriAPI } from '../lib/tauri'

interface Build {
  id: string
  name: string
  folder: string
  exePath: string
  dllPath?: string
  backendUrl?: string
}

const STORAGE_KEY = 'launcher_builds'

function loadBuilds(): Build[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveBuilds(builds: Build[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds))
}

export default function LibraryPage() {
  const [builds, setBuilds] = useState<Build[]>(loadBuilds)
  const [launching, setLaunching] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [options, setOptions] = useState<string | null>(null)
  const [showConfirmWipe, setShowConfirmWipe] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { saveBuilds(builds) }, [builds])

  const handleAdd = async () => {
    setError('')
    setImporting(true)
    try {
      const result = await tauriAPI.selectFortniteFolder()
      if (!result) return
      if (!result.exePath) {
        setError('FortniteClient-Win64-Shipping.exe not found in the selected folder.')
        return
      }
      const name = result.folder.split('\\').pop() || result.folder.split('/').pop() || 'Fortnite'
      setBuilds(prev => [...prev, { id: Date.now().toString(), name, folder: result.folder, exePath: result.exePath! }])
    } finally {
      setImporting(false)
    }
  }

  const handleLaunch = async (build: Build) => {
    setLaunching(build.id)
    setError('')
    const res = await tauriAPI.launchGame({ exePath: build.exePath, dllPath: build.dllPath, backendUrl: build.backendUrl })
    setLaunching(null)
    if (res && !res.success) setError(res.error || 'Failed to launch.')
  }

  const handleDelete = (id: string) => {
    setOptions(null)
    setBuilds(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.05]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Library</h1>
          <p className="text-zinc-600 text-xs mt-0.5">
            {builds.length} {builds.length === 1 ? 'build' : 'builds'} installed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {builds.length > 0 && (
            <button
              onClick={() => setShowConfirmWipe(true)}
              className="p-2 rounded-lg bg-[#262626] hover:bg-[#333] text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete all builds"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={handleAdd}
            disabled={importing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all bg-[#262626] hover:bg-[#333] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Import Build
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {builds.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3 py-20"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <FolderOpen size={22} className="text-zinc-600" />
              </div>
              <p className="text-white font-semibold text-sm">No builds yet</p>
              <p className="text-zinc-600 text-xs text-center max-w-xs">
                Click <span className="text-white font-medium">Import Build</span> to add your Fortnite installation.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-4"
            >
              {builds.map((build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  launching={launching === build.id}
                  options={options}
                  setOptions={setOptions}
                  onLaunch={() => handleLaunch(build)}
                  onDelete={() => handleDelete(build.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showConfirmWipe && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowConfirmWipe(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-red-900/30 rounded-2xl p-7 max-w-sm w-full"
            >
              <div className="flex items-center justify-center mb-5">
                <AlertTriangle className="text-red-400" size={28} />
              </div>
              <h2 className="text-lg font-bold text-white text-center mb-2">Delete All Builds?</h2>
              <p className="text-zinc-500 text-xs text-center mb-6 leading-relaxed">
                This removes <span className="text-white font-semibold">{builds.length} {builds.length === 1 ? 'build' : 'builds'}</span> from the launcher.
                Your actual game files are not deleted.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowConfirmWipe(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer bg-[#262626] hover:bg-[#333] text-white border border-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setBuilds([]); setShowConfirmWipe(false) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BuildCard({ build, launching, options, setOptions, onLaunch, onDelete }: {
  build: Build
  launching: boolean
  options: string | null
  setOptions: (id: string | null) => void
  onLaunch: () => void
  onDelete: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative group rounded-xl overflow-hidden border border-white/[0.08] transition-all duration-200 hover:shadow-xl hover:shadow-black/30"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div className="relative h-36 overflow-hidden bg-zinc-950">
        <img
          src="6900d36fcf71b.webp"
          alt={build.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-2 right-2 flex gap-1.5"
            >
              <button
                onClick={onLaunch}
                disabled={launching}
                className="p-2 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 backdrop-blur-sm transition-all cursor-pointer disabled:opacity-40"
                title="Launch"
              >
                {launching
                  ? <Loader2 size={14} className="text-white animate-spin" />
                  : <Play size={14} className="text-white" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setOptions(options === build.id ? null : build.id)}
                  className="p-2 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
                >
                  <MoreVertical size={14} className="text-white" />
                </button>

                <AnimatePresence>
                  {options === build.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      className="absolute bottom-full right-0 mb-1.5 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden shadow-2xl min-w-[140px] z-10"
                    >
                      <button
                        onClick={() => { open(build.folder); setOptions(null) }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <FolderOpen size={13} /> Open Folder
                      </button>
                      <button
                        onClick={onDelete}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors border-t border-zinc-800"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3.5 py-3 bg-[#0d0d0d]">
        <p className="text-sm font-bold text-white truncate">{build.name}</p>
        <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{build.folder}</p>
      </div>
    </motion.div>
  )
}
