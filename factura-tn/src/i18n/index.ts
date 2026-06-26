import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr.json'
import ar from './ar.json'

export type Language = 'fr' | 'ar'
export const LANGUAGES: Language[] = ['fr', 'ar']
export const DEFAULT_LANG: Language = 'fr'

const savedLang = (localStorage.getItem('factura-lang') as Language) || DEFAULT_LANG

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
})

export default i18n
