import { pdf } from '@react-pdf/renderer'
import { createElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { InvoicePDF } from '../components/invoice/InvoicePDF'
import type { Invoice } from '../types/invoice'
import { useSettingsStore } from '../stores/settingsStore'

export async function downloadInvoicePDF(invoice: Invoice): Promise<void> {
  const settings = useSettingsStore.getState()
  const element = createElement(
    InvoicePDF,
    { invoice, settings }
  ) as unknown as ReactElement<DocumentProps>
  const blob = await pdf(element).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${invoice.number}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
