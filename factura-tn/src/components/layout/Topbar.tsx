import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../ui/LanguageToggle'

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { t } = useTranslation()

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        aria-label="Menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden text-sm text-gray-500 dark:text-gray-400 lg:block">
        {t('common.appName')}
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle />
        <div className="h-8 w-8 rounded-full bg-primary-600 text-sm font-semibold text-white grid place-items-center">
          A
        </div>
      </div>
    </header>
  )
}
