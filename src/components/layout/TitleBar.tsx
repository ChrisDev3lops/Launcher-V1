import { X, Minus } from 'lucide-react'
import { tauriAPI } from '../../lib/tauri'

export default function TitleBar() {
  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-9 flex-shrink-0 select-none border-b border-white/[0.06]"
    >
      <div className="flex-1" />

      <div className="flex items-center">
        <button
          onClick={() => tauriAPI.minimize()}
          className="w-10 h-9 flex items-center justify-center transition-colors duration-150 hover:bg-white/5 cursor-pointer"
          aria-label="Minimize"
        >
          <Minus size={13} className="text-zinc-500 hover:text-zinc-300" strokeWidth={2} />
        </button>
        <button
          onClick={() => tauriAPI.close()}
          className="w-10 h-9 flex items-center justify-center transition-colors duration-150 hover:bg-red-500/20 cursor-pointer"
          aria-label="Close"
        >
          <X size={13} className="text-zinc-500 hover:text-red-400" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
