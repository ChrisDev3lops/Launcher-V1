import { X, Minus, Square } from 'lucide-react'
import clsx from 'clsx'

interface TitleBarProps {
  transparent?: boolean
}

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void
      maximize: () => void
      close: () => void
    }
  }
}

export default function TitleBar({ transparent = false }: TitleBarProps) {
  const minimize = () => window.electronAPI?.minimize()
  const maximize = () => window.electronAPI?.maximize()
  const close = () => window.electronAPI?.close()

  return (
    <div
      className={clsx(
        'flex items-center justify-between h-9 px-4 flex-shrink-0 select-none',
        transparent ? 'bg-transparent' : 'bg-dark-200/80'
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Drag region fills most of the bar */}
      <div className="flex-1" />

      {/* Window controls */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={minimize}
          className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={maximize}
          className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={close}
          className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
