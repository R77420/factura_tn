import type { Invoice } from '../types/invoice'
import type { VatRate } from '../types/invoice'

export function getMonthlyRevenue(
  invoices: Invoice[],
  month: number,
  year: number
): number {
  return invoices
    .filter((inv) => {
      const d = inv.issueDate
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        (inv.status === 'sent' || inv.status === 'paid')
      )
    })
    .reduce((sum, inv) => sum + inv.totals.totalTTC, 0)
}

export function getMonthlyInvoiceCount(
  invoices: Invoice[],
  month: number,
  year: number
): number {
  return invoices.filter((inv) => {
    const d = inv.issueDate
    return (
      d.getFullYear() === year &&
      d.getMonth() === month &&
      inv.status !== 'draft'
    )
  }).length
}

export function getOverdueInvoices(invoices: Invoice[]): Invoice[] {
  const now = new Date()
  return invoices.filter(
    (inv) =>
      inv.status === 'overdue' ||
      (inv.status === 'sent' && inv.dueDate < now)
  )
}

export interface VATSummaryLine {
  rate: VatRate
  baseHT: number
  vatAmount: number
}

export function getMonthlyVATSummary(
  invoices: Invoice[],
  month: number,
  year: number
): VATSummaryLine[] {
  const map = new Map<VatRate, { baseHT: number; vatAmount: number }>()

  invoices
    .filter((inv) => {
      const d = inv.issueDate
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        (inv.status === 'sent' || inv.status === 'paid')
      )
    })
    .forEach((inv) => {
      inv.totals.vatBreakdown.forEach(({ rate, base, amount }) => {
        const entry = map.get(rate as VatRate) ?? { baseHT: 0, vatAmount: 0 }
        map.set(rate as VatRate, {
          baseHT: entry.baseHT + base,
          vatAmount: entry.vatAmount + amount,
        })
      })
    })

  return Array.from(map.entries())
    .map(([rate, v]) => ({ rate, ...v }))
    .sort((a, b) => b.rate - a.rate)
}

export interface MonthRevenue {
  month: string
  monthIndex: number
  year: number
  revenue: number
}

const FR_MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
]
const AR_MONTHS = [
  'جان', 'فيف', 'مار', 'أفر', 'ماي', 'جوان',
  'جوي', 'أوت', 'سبت', 'أكت', 'نوف', 'ديس',
]

export function getRevenueByMonth(
  invoices: Invoice[],
  _year: number,
  lang: string
): MonthRevenue[] {
  const now = new Date()
  const results: MonthRevenue[] = []
  const labels = lang === 'ar' ? AR_MONTHS : FR_MONTHS

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth()
    const y = d.getFullYear()
    results.push({
      month: labels[m],
      monthIndex: m,
      year: y,
      revenue: getMonthlyRevenue(invoices, m, y),
    })
  }

  return results
}
