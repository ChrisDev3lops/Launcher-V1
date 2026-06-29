import { NavLink } from 'react-router-dom'
import { Home, Library, ShoppingBag, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const navItems = [
  { to: '/',        icon: Home,        label: 'Home',    end: true },
  { to: '/library', icon: Library,     label: 'Library' },
  { to: '/shop',    icon: ShoppingBag, label: 'Shop' },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="w-[88px] h-full flex flex-col items-center py-5 bg-black/50 border-r border-white/5 flex-shrink-0">

      {/* Logo icon at the top */}
      <div className="mb-6 flex-shrink-0">
        <img
          src="aaecc863-a686-4d4e-bd97-14dea0403af7.ico"
          alt="water"
          className="w-10 h-10 object-contain"
          onError={(e) => {
            // fallback if ico doesn't render
            const t = e.currentTarget
            t.style.display = 'none'
          }}
        />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-white/8 mb-5 flex-shrink-0" />

      {/* Main nav */}
      <nav className="flex flex-col items-center gap-3 flex-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              clsx(
                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer group',
                isActive
                  ? 'bg-white/10 text-white ring-1 ring-white/15 shadow-lg'
                  : 'text-white/35 hover:text-white hover:bg-white/8 hover:ring-1 hover:ring-white/10'
              )
            }
          >
            {({ isActive }) => (
              <Icon className={clsx('w-5 h-5 transition-transform duration-200', !isActive && 'group-hover:scale-110')} />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-3">
        <NavLink
          to="/settings"
          title="Settings"
          className={({ isActive }) =>
            clsx(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer group',
              isActive
                ? 'bg-white/10 text-white ring-1 ring-white/15'
                : 'text-white/35 hover:text-white hover:bg-white/8 hover:ring-1 hover:ring-white/10'
            )
          }
        >
          {({ isActive }) => (
            <Settings className={clsx('w-5 h-5 transition-all duration-200', !isActive && 'group-hover:rotate-45')} />
          )}
        </NavLink>

        <button
          onClick={logout}
          title="Sign Out"
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:ring-1 hover:ring-red-500/20 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>
      </div>
    </aside>
  )
}
