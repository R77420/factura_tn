import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useInvoiceStore } from '../stores/invoiceStore'
import { useLanguage } from '../hooks/useLanguage'
import { formatCurrency, formatDate } from '../utils/invoice'
import {
  getMonthlyRevenue,
  getMonthlyInvoiceCount,
  getMonthlyVATSummary,
  getOverdueInvoices,
  getRevenueByMonth,
} from '../utils/dashboard'
import type { InvoiceStatus } from '../types/invoice'

// ── Status badge ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {t(`invoice.status_${status}`)}
    </span>
  )
}

// ── KPI card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: string
  icon: string
  accent?: 'green' | 'blue' | 'yellow' | 'red'
  badge?: number
}

function KpiCard({ label, value, icon, accent = 'blue', badge }: KpiCardProps) {
  const accentBg: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white truncate" dir="ltr">
            {value}
          </p>
        </div>
        <div className="relative flex-shrink-0">
          <span className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl ${accentBg[accent]}`}>
            {icon}
          </span>
          {badge != null && badge > 0 && (
            <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Custom tooltip for recharts ──────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
  tooltipLabel,
  language,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  tooltipLabel: string
  language: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-bold text-primary-600" dir="ltr">
        {formatCurrency(payload[0].value, language)}
      </p>
      <p className="text-xs text-gray-400">{tooltipLabel}</p>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { t } = useTranslation()
  const { language, isRTL } = useLanguage()
  const navigate = useNavigate()
  const invoices = useInvoiceStore((s) => s.invoices)

  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  const monthlyRevenue = useMemo(
    () => getMonthlyRevenue(invoices, month, year),
    [invoices, month, year]
  )
  const monthlyCount = useMemo(
    () => getMonthlyInvoiceCount(invoices, month, year),
    [invoices, month, year]
  )
  const vatSummary = useMemo(
    () => getMonthlyVATSummary(invoices, month, year),
    [invoices, month, year]
  )
  const overdueInvoices = useMemo(
    () => getOverdueInvoices(invoices),
    [invoices]
  )
  const chartData = useMemo(
    () => getRevenueByMonth(invoices, year, language),
    [invoices, year, language]
  )
  const monthlyVAT = useMemo(
    () => vatSummary.reduce((s, v) => s + v.vatAmount, 0),
    [vatSummary]
  )
  const recentInvoices = useMemo(
    () => [...invoices].slice(0, 5),
    [invoices]
  )

  // ── Empty state ────────────────────────────────────────────────────────────
  if (invoices.length === 0) {
    return (
      <div className="flex h-full min-h-96 flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-gray-300 bg-white py-20 dark:border-gray-700 dark:bg-gray-900">
        <span className="text-6xl" aria-hidden="true">🧾</span>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.emptyTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.emptyDescription')}
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices/new')}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          {t('dashboard.firstInvoice')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('dashboard.welcomeSub')}
        </p>
      </div>

      {/* ── Row 1 : KPI cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t('dashboard.kpi.monthlyRevenue')}
          value={formatCurrency(monthlyRevenue, language)}
          icon="💰"
          accent="green"
        />
        <KpiCard
          label={t('dashboard.kpi.invoiceCount')}
          value={String(monthlyCount)}
          icon="🧾"
          accent="blue"
        />
        <KpiCard
          label={t('dashboard.kpi.vatDue')}
          value={formatCurrency(monthlyVAT, language)}
          icon="🏛️"
          accent="yellow"
        />
        <KpiCard
          label={t('dashboard.kpi.overdueCount')}
          value={String(overdueInvoices.length)}
          icon="⚠️"
          accent={overdueInvoices.length > 0 ? 'red' : 'blue'}
          badge={overdueInvoices.length}
        />
      </div>

      {/* ── Row 2 : Revenue chart ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {t('dashboard.chart.title')}
        </h2>
        {chartData.every((d) => d.revenue === 0) ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-gray-400">{t('dashboard.chart.noData')}</p>
          </div>
        ) : (
          <div dir={isRTL ? 'rtl' : 'ltr'}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  reversed={isRTL}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`
                  }
                  orientation={isRTL ? 'right' : 'left'}
                  width={40}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      tooltipLabel={t('dashboard.chart.tooltip')}
                      language={language}
                    />
                  }
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Row 3 : Recent invoices + VAT summary ────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent invoices */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('dashboard.recentInvoices.title')}
            </h2>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              {t('dashboard.recentInvoices.viewAll')}
            </button>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-gray-400">{t('dashboard.recentInvoices.empty')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentInvoices.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {inv.client.name}
                    </p>
                    <p className="text-xs text-gray-400" dir="ltr">
                      {inv.number} · {formatDate(inv.issueDate, language)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white" dir="ltr">
                      {formatCurrency(inv.totals.totalTTC, language)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* VAT summary */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('dashboard.vatSummary.title')}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {t('dashboard.vatSummary.dgiNote')}
            </p>
          </div>
          {vatSummary.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-gray-400">{t('dashboard.vatSummary.empty')}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 dark:border-gray-800">
                <tr className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 text-start">{t('dashboard.vatSummary.rate')}</th>
                  <th className="px-5 py-3 text-end">{t('dashboard.vatSummary.baseHT')}</th>
                  <th className="px-5 py-3 text-end">{t('dashboard.vatSummary.vatAmount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {vatSummary.map((row) => (
                  <tr
                    key={String(row.rate)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-5 py-3 font-mono font-medium text-gray-900 dark:text-white" dir="ltr">
                      {row.rate === 0 ? '0%' : `${row.rate * 100}%`}
                    </td>
                    <td className="px-5 py-3 text-end text-gray-600 dark:text-gray-300" dir="ltr">
                      {formatCurrency(row.baseHT, language)}
                    </td>
                    <td className="px-5 py-3 text-end font-semibold text-gray-900 dark:text-white" dir="ltr">
                      {formatCurrency(row.vatAmount, language)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <td className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Total
                  </td>
                  <td className="px-5 py-3 text-end font-bold text-gray-900 dark:text-white" dir="ltr">
                    {formatCurrency(
                      vatSummary.reduce((s, v) => s + v.baseHT, 0),
                      language
                    )}
                  </td>
                  <td className="px-5 py-3 text-end font-bold text-primary-600" dir="ltr">
                    {formatCurrency(monthlyVAT, language)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
