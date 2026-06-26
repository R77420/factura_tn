import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'
import type { InvoiceStatus } from '../types/invoice'
import { formatCurrency, formatDate } from '../utils/invoice'
import { useInvoiceStore } from '../stores/invoiceStore'

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}



const ALL_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue']

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {t(`invoice.status_${status}`)}
    </span>
  )
}

export function InvoiceListPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()

  const invoices = useInvoiceStore((s) => s.invoices)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        !search ||
        inv.number.toLowerCase().includes(search.toLowerCase()) ||
        inv.client.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || inv.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [invoices, search, statusFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('invoice.list.title')}
        </h1>
        <button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <span aria-hidden="true">+</span>
          {t('invoice.new')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            className="w-full rounded-lg border border-gray-200 bg-white py-2 ps-9 pe-4 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder={t('invoice.list.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
        >
          <option value="">{t('common.all')}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`invoice.status_${s}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-gray-400">
              {search || statusFilter
                ? t('invoice.list.emptyFiltered')
                : t('invoice.list.empty')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-start">{t('invoice.number')}</th>
                  <th className="px-4 py-3 text-start">{t('invoice.client.name')}</th>
                  <th className="px-4 py-3 text-start">{t('invoice.issueDate')}</th>
                  <th className="px-4 py-3 text-end">{t('invoice.totals.totalTTC')}</th>
                  <th className="px-4 py-3 text-center">{t('invoice.status')}</th>
                  <th className="px-4 py-3 text-center">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium text-primary-600">
                        {inv.number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {inv.client.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500" dir="ltr">
                      {formatDate(inv.issueDate, language)}
                    </td>
                    <td className="px-4 py-3 text-end font-semibold text-gray-900 dark:text-white" dir="ltr">
                      {formatCurrency(inv.totals.totalTTC, language)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                        className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        {t('buttons.edit')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
