export type { Language } from '../i18n'

export interface NavItem {
  key: string
  labelKey: string
  path: string
  icon: string
}

export interface StatCard {
  labelKey: string
  value: string | number
  trend?: number
}
