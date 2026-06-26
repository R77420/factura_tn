export type { Client } from './client'

export type VatRate = 0.19 | 0.13 | 0.07 | 0

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface Seller {
  name: string
  address: string
  city: string
  phone: string
  email: string
  matriculeFiscal: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: VatRate
  totalHT: number
  totalTVA: number
  totalTTC: number
}

export interface InvoiceTotals {
  totalHT: number
  totalTVA: number
  totalTTC: number
  vatBreakdown: { rate: VatRate; base: number; amount: number }[]
}

export interface Invoice {
  id: string
  /** Format: FAC-YYYY-XXXX */
  number: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  seller: Seller
  client: import('./client').Client
  items: LineItem[]
  totals: InvoiceTotals
  notes: string
}
