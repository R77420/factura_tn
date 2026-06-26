import { useNavigate } from 'react-router-dom'
import { useInvoiceStore } from '../stores/invoiceStore'
import { useSettingsStore } from '../stores/settingsStore'
import { generateInvoiceNumber } from '../utils/invoice'
import { InvoiceForm } from '../components/invoice/InvoiceForm'
import type { Invoice } from '../types/invoice'

export function InvoiceCreatePage() {
  const navigate = useNavigate()
  const { addInvoice, lastInvoiceNumber } = useInvoiceStore()
  const { invoicePrefix } = useSettingsStore()

  const invoiceNumber = generateInvoiceNumber(lastInvoiceNumber, invoicePrefix)

  const handleSaveDraft = (invoice: Invoice) => {
    addInvoice({ ...invoice, status: 'draft' })
    navigate('/invoices')
  }

  const handleEmit = async (invoice: Invoice) => {
    const emitted = { ...invoice, status: 'sent' as const }
    addInvoice(emitted)
    const { downloadInvoicePDF } = await import('../utils/generatePDF')
    await downloadInvoicePDF(emitted)
    navigate('/invoices')
  }

  return (
    <InvoiceForm
      mode="create"
      invoiceNumber={invoiceNumber}
      onSaveDraft={handleSaveDraft}
      onEmit={handleEmit}
    />
  )
}
