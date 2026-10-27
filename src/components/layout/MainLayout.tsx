import { Outlet } from 'react-router-dom'
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'
import { useTheme } from '../../context/ThemeContext'
import SnowEffect from '../SnowEffect'

export default function MainLayout() {
  const { theme } = useTheme()

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden relative"
      style={{ backgroundColor: theme.bg }}
    >
      <SnowEffect />

      <TitleBar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
