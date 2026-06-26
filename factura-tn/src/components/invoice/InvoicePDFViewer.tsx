import { PDFViewer } from '@react-pdf/renderer'
import { InvoicePDF } from './InvoicePDF'
import { useSettingsStore } from '../../stores/settingsStore'
import type { Invoice } from '../../types/invoice'

interface InvoicePDFViewerProps {
  invoice: Invoice
  height?: string
}

export function InvoicePDFViewer({ invoice, height = '700px' }: InvoicePDFViewerProps) {
  const settings = useSettingsStore()
  return (
    <PDFViewer width="100%" height={height} showToolbar={false} style={{ border: 'none' }}>
      <InvoicePDF invoice={invoice} settings={settings} />
    </PDFViewer>
  )
}
