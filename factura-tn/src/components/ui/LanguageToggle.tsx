import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../hooks/useLanguage'

export function LanguageToggle() {
  const { t } = useTranslation()
  const { language, setLanguage, isRTL } = useLanguage()

  const toggle = () => setLanguage(language === 'fr' ? 'ar' : 'fr')

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label={t('common.language')}
      dir={isRTL ? 'ltr' : 'rtl'}
    >
      <span className="text-base">{language === 'fr' ? '🇹🇳' : '🇫🇷'}</span>
      <span>{t('common.switchLang')}</span>
    </button>
  )
}
