import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../hooks/useLanguage'

const NAV_ITEMS = [
  { key: 'dashboard', path: '/', icon: '▦' },
  { key: 'invoices', path: '/invoices', icon: '🧾' },
  { key: 'clients', path: '/clients', icon: '👥' },
  { key: 'products', path: '/products', icon: '📦' },
  { key: 'reports', path: '/reports', icon: '📊' },
  { key: 'settings', path: '/settings', icon: '⚙️' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed top-0 z-30 flex h-full w-64 flex-col bg-brand-navy shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none',
          isRTL ? 'right-0' : 'left-0',
          isOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <span className="text-xl font-bold tracking-tight text-white">
            Factura <span className="text-primary-500">TN</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white',
                    ].join(' ')
                  }
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="flex-1">{t(`nav.${item.key}`)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 text-xs text-gray-400">
          © 2026 Factura TN
        </div>
      </aside>
    </>
  )
}
