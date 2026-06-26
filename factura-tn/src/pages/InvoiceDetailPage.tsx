import { Suspense, lazy, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'
import { useInvoiceStore } from '../stores/invoiceStore'
import { formatCurrency, formatDate, vatLabel } from '../utils/invoice'
import type { InvoiceStatus } from '../types/invoice'

// Lazy-load to keep @react-pdf/renderer out of the main bundle
const InvoicePDFViewer = lazy(() =>
  import('../components/invoice/InvoicePDFViewer').then((m) => ({
    default: m.InvoicePDFViewer,
  }))
)

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const { invoices } = useInvoiceStore()
  const [isDownloading, setIsDownloading] = useState(false)

  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
        <p className="text-base font-medium text-gray-900 dark:text-white">
          {t('invoice.detail.notFound')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('invoice.detail.notFoundDesc')}
        </p>
        <button
          onClick={() => navigate('/invoices')}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          {t('buttons.back')}
        </button>
      </div>
    )
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const { downloadInvoicePDF } = await import('../utils/generatePDF')
      await downloadInvoicePDF(invoice)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {invoice.number}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[invoice.status]}`}
            >
              {t(`invoice.status_${invoice.status}`)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500" dir="ltr">
            {formatDate(invoice.issueDate, language)}
            {invoice.dueDate && ` → ${formatDate(invoice.dueDate, language)}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← {t('invoice.detail.backToList')}
          </button>
          <button
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            className="rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            {t('buttons.edit')}
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
          >
            {isDownloading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t('invoice.generating')}
              </>
            ) : (
              t('invoice.detail.download')
            )}
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {t('invoice.client.title')}
          </h2>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-gray-900 dark:text-white">{invoice.client.name}</p>
            {invoice.client.address && (
              <p className="text-gray-500">
                {invoice.client.address}
                {invoice.client.city ? `, ${invoice.client.city}` : ''}
              </p>
            )}
            {invoice.client.phone && (
              <p className="text-gray-500" dir="ltr">{invoice.client.phone}</p>
            )}
            {invoice.client.email && (
              <p className="text-gray-500">{invoice.client.email}</p>
            )}
            {invoice.client.matriculeFiscal && (
              <p className="font-mono text-xs text-gray-500" dir="ltr">
                MF : {invoice.client.matriculeFiscal}
              </p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {t('invoice.detail.totalsTitle')}
          </h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">{t('invoice.totals.totalHT')}</dt>
              <dd className="font-medium text-gray-900 dark:text-white" dir="ltr">
                {formatCurrency(invoice.totals.totalHT, language)}
              </dd>
            </div>
            {invoice.totals.vatBreakdown.map((v) => (
              <div key={String(v.rate)} className="flex justify-between">
                <dt className="text-gray-500">
                  {t('invoice.totals.vatDetail', { rate: vatLabel(v.rate) })}
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white" dir="ltr">
                  {formatCurrency(v.amount, language)}
                </dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-200 pt-1.5 dark:border-gray-700">
              <dt className="font-semibold text-gray-900 dark:text-white">
                {t('invoice.totals.totalTTC')}
              </dt>
              <dd className="text-lg font-bold text-primary-600" dir="ltr">
                {formatCurrency(invoice.totals.totalTTC, language)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Line items */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {t('invoice.lines.title')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr className="text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 text-start">{t('invoice.lines.description')}</th>
                <th className="px-4 py-3 text-end w-20">{t('invoice.lines.quantity')}</th>
                <th className="px-4 py-3 text-end w-32">{t('invoice.lines.unitPrice')}</th>
                <th className="px-4 py-3 text-center w-24">{t('invoice.lines.vatRate')}</th>
                <th className="px-4 py-3 text-end w-28">{t('invoice.lines.totalHT')}</th>
                <th className="px-4 py-3 text-end w-28">{t('invoice.lines.totalTTC')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{item.description}</td>
                  <td className="px-4 py-3 text-end text-gray-700 dark:text-gray-300" dir="ltr">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-end text-gray-700 dark:text-gray-300" dir="ltr">
                    {formatCurrency(item.unitPrice, language)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700 dark:text-gray-300" dir="ltr">
                    {vatLabel(item.vatRate)}
                  </td>
                  <td className="px-4 py-3 text-end font-medium text-gray-700 dark:text-gray-300" dir="ltr">
                    {formatCurrency(item.totalHT, language)}
                  </td>
                  <td className="px-4 py-3 text-end font-semibold text-gray-900 dark:text-white" dir="ltr">
                    {formatCurrency(item.totalTTC, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invoice.notes && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {t('invoice.notes')}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{invoice.notes}</p>
        </div>
      )}

      {/* Embedded PDF viewer */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {t('invoice.detail.pdfPreview')}
          </h2>
        </div>
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <svg className="me-3 h-5 w-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm text-gray-500">{t('common.loading')}</span>
            </div>
          }
        >
          <InvoicePDFViewer invoice={invoice} height="700px" />
        </Suspense>
      </div>
    </div>
  )
}
