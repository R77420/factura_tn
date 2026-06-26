import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from '../i18n'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('factura-lang') as Language) || 'fr'
  )

  const isRTL = language === 'ar'

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    i18n.changeLanguage(lang)
    localStorage.setItem('factura-lang', lang)
  }

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', language)
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    html.style.fontFamily = isRTL
      ? "'Noto Sans Arabic', sans-serif"
      : "'Inter', sans-serif"
  }, [language, isRTL])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
