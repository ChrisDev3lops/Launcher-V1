import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Folder, ShoppingBag, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'
import { ReactNode } from 'react'

const navItems = [
  { to: '/',        icon: Home,        label: 'Home',    end: true },
  { to: '/library', icon: Folder,      label: 'Library' },
  { to: '/shop',    icon: ShoppingBag, label: 'Shop' },
]

function NavButton({ to, icon: Icon, label, end, onClick, danger }: {
  to?: string
  icon: React.ElementType
  label: string
  end?: boolean
  onClick?: () => void
  danger?: boolean
}) {
  const nav = useNavigate()
  const location = useLocation()
  const active = to ? (end ? location.pathname === to : location.pathname.startsWith(to)) : false

  const button: ReactNode = (
    <button
      onClick={onClick ?? (() => to && nav(to))}
      aria-label={label}
      className={clsx(
        'w-10 h-10 mx-2 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer',
        active ? 'bg-white/10' : 'hover:bg-white/5'
      )}
    >
      <Icon
        size={17}
        strokeWidth={active ? 2.5 : 2}
        className={clsx(
          'transition-colors',
          active
            ? 'text-white'
            : danger
              ? 'text-zinc-600 group-hover:text-red-400'
              : 'text-zinc-500 group-hover:text-zinc-300'
        )}
      />
    </button>
  )

  return (
    <div className="relative group">
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-white/70" />
      )}
      {button}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-white rounded-md pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-[#1a1a1a] border border-white/10 z-50">
        {label}
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="w-14 h-full flex flex-col items-center py-3 border-r border-white/[0.05] flex-shrink-0">
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavButton key={item.to} {...item} />
        ))}
      </nav>

      <div className="flex flex-col gap-1">
        <NavButton to="/settings" icon={Settings} label="Settings" />
        <NavButton icon={LogOut} label="Sign Out" onClick={logout} danger />
      </div>
    </aside>
  )
}
