import type { LineItem, VatRate, InvoiceTotals } from '../types/invoice'

export function formatCurrency(amount: number, lang: string): string {
  if (lang === 'ar') {
    const formatted = amount.toLocaleString('ar-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })
    return `د.ت ${formatted}`
  }
  const formatted = amount.toLocaleString('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
  return `${formatted} DT`
}

export function formatDate(date: Date, lang: string): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return lang === 'ar' ? `${y}/${m}/${d}` : `${d}/${m}/${y}`
}

export function calculateLineItem(
  quantity: number,
  unitPrice: number,
  vatRate: VatRate
): { totalHT: number; totalTVA: number; totalTTC: number } {
  const totalHT = Math.round(quantity * unitPrice * 1000) / 1000
  const totalTVA = Math.round(totalHT * vatRate * 1000) / 1000
  const totalTTC = Math.round((totalHT + totalTVA) * 1000) / 1000
  return { totalHT, totalTVA, totalTTC }
}

export function calculateInvoiceTotals(items: LineItem[]): InvoiceTotals {
  const vatMap = new Map<VatRate, { base: number; amount: number }>()

  let totalHT = 0
  let totalTVA = 0

  for (const item of items) {
    totalHT += item.totalHT
    totalTVA += item.totalTVA
    const entry = vatMap.get(item.vatRate) ?? { base: 0, amount: 0 }
    vatMap.set(item.vatRate, {
      base: entry.base + item.totalHT,
      amount: entry.amount + item.totalTVA,
    })
  }

  totalHT = Math.round(totalHT * 1000) / 1000
  totalTVA = Math.round(totalTVA * 1000) / 1000
  const totalTTC = Math.round((totalHT + totalTVA) * 1000) / 1000

  const vatBreakdown = Array.from(vatMap.entries()).map(([rate, v]) => ({
    rate,
    base: Math.round(v.base * 1000) / 1000,
    amount: Math.round(v.amount * 1000) / 1000,
  }))

  return { totalHT, totalTVA, totalTTC, vatBreakdown }
}

export function generateInvoiceNumber(lastNumber: number): string {
  const year = new Date().getFullYear()
  const seq = String(lastNumber + 1).padStart(4, '0')
  return `FAC-${year}-${seq}`
}

export const MATRICULE_FISCAL_REGEX = /^\d{7}\/[A-Z]\/[A-Z]\/\d{3}$/

export function validateMatriculeFiscal(value: string): boolean {
  return MATRICULE_FISCAL_REGEX.test(value)
}

export const VAT_RATES: VatRate[] = [0.19, 0.13, 0.07, 0]

export function vatLabel(rate: VatRate): string {
  return rate === 0 ? '0%' : `${rate * 100}%`
}
