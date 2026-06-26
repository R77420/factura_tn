import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import type { Invoice } from '../../types/invoice'

// Lazy-load both PDFViewer and InvoicePDF to keep @react-pdf/renderer out of main bundle
const InvoicePDFViewer = lazy(() =>
  import('./InvoicePDFViewer').then((m) => ({ default: m.InvoicePDFViewer }))
)

interface InvoicePreviewModalProps {
  invoice: Invoice
  isEmitting: boolean
  onClose: () => void
  onEmit: () => Promise<void>
}

export function InvoicePreviewModal({
  invoice,
  isEmitting,
  onClose,
  onEmit,
}: InvoicePreviewModalProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
      {/* Toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between bg-white px-4 py-3 shadow dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('invoice.previewModal.title')} — {invoice.number}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onEmit}
            disabled={isEmitting}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
          >
            {isEmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t('invoice.generating')}
              </>
            ) : (
              t('invoice.previewModal.emitFromModal')
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t('invoice.previewModal.close')}
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-white">
              <svg className="me-3 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {t('common.loading')}
            </div>
          }
        >
          <InvoicePDFViewer invoice={invoice} height="100%" />
        </Suspense>
      </div>
    </div>
  )
}
