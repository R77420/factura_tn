import type { VatRate } from './invoice'

export interface Product {
  id: string
  name: string
  description: string
  unitPrice: number
  vatRate: VatRate
  unit: string
  createdAt: Date
}

export const PRODUCT_UNITS = ['heure', 'jour', 'unité', 'forfait', 'mois'] as const
export type ProductUnit = (typeof PRODUCT_UNITS)[number]
