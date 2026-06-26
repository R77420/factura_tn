import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useInvoiceStore } from '../stores/invoiceStore'
import { InvoiceForm } from '../components/invoice/InvoiceForm'
import type { Invoice } from '../types/invoice'

export function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { invoices, updateInvoice } = useInvoiceStore()

  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('invoice.detail.notFound')}
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

  const initialValues = {
    client: invoice.client,
    seller: invoice.seller,
    items: invoice.items,
    issueDate: invoice.issueDate.toISOString().split('T')[0],
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split('T')[0] : '',
    notes: invoice.notes,
  }

  const handleSaveDraft = (updated: Invoice) => {
    updateInvoice(invoice.id, { ...updated, id: invoice.id, status: 'draft' })
    navigate(`/invoices/${invoice.id}`)
  }

  const handleEmit = async (updated: Invoice) => {
    const emitted = { ...updated, id: invoice.id, status: 'sent' as const }
    updateInvoice(invoice.id, emitted)
    const { downloadInvoicePDF } = await import('../utils/generatePDF')
    await downloadInvoicePDF(emitted)
    navigate(`/invoices/${invoice.id}`)
  }

  return (
    <InvoiceForm
      mode="edit"
      invoiceNumber={invoice.number}
      initialValues={initialValues}
      onSaveDraft={handleSaveDraft}
      onEmit={handleEmit}
    />
  )
}
