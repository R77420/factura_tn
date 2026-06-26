import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'
import type { LineItem, VatRate, Seller, Invoice } from '../types/invoice'
import type { Client } from '../types/client'
import {
  calculateLineItem,
  calculateInvoiceTotals,
  validateMatriculeFiscal,
  formatCurrency,
  vatLabel,
  VAT_RATES,
} from '../utils/invoice'
import { useInvoiceStore } from '../stores/invoiceStore'
import { useClientStore } from '../stores/clientStore'
import { ClientFormModal } from '../components/client/ClientFormModal'

const EMPTY_CLIENT: Client = {
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  matriculeFiscal: '',
}

const DEFAULT_SELLER: Seller = {
  name: 'Mon Entreprise SARL',
  address: 'Avenue Habib Bourguiba',
  city: 'Tunis',
  phone: '+216 71 000 000',
  email: 'contact@monentreprise.tn',
  matriculeFiscal: '',
}

function newLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: 0.19,
    totalHT: 0,
    totalTVA: 0,
    totalTTC: 0,
  }
}

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}

function Field({ label, error, children, required }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ms-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white'

export function InvoiceCreatePage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()

  const [client, setClient] = useState<Client>(EMPTY_CLIENT)
  const [seller, setSeller] = useState<Seller>(DEFAULT_SELLER)
  const [items, setItems] = useState<LineItem[]>([newLineItem()])
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)

  const { addInvoice, getNextInvoiceNumber } = useInvoiceStore()
  const { clients, addClient } = useClientStore()
  const invoiceNumber = getNextInvoiceNumber()
  const totals = calculateInvoiceTotals(items)

  const selectClient = (id: string) => {
    const found = clients.find((c) => c.id === id)
    if (found) {
      setClient(found)
      setErrors((prev) => ({ ...prev, 'client.name': '' }))
    } else {
      setClient(EMPTY_CLIENT)
    }
  }

  const handleQuickCreateClient = (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient = addClient(data)
    setClient(newClient)
    setShowClientModal(false)
  }

  const updateClient = (field: keyof Client, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [`client.${field}`]: '' }))
  }

  const updateItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const updated = { ...item, [field]: value }
          if (['quantity', 'unitPrice', 'vatRate'].includes(field)) {
            const calc = calculateLineItem(
              field === 'quantity' ? Number(value) : updated.quantity,
              field === 'unitPrice' ? Number(value) : updated.unitPrice,
              field === 'vatRate' ? (Number(value) as VatRate) : updated.vatRate
            )
            return { ...updated, ...calc }
          }
          return updated
        })
      )
    },
    []
  )

  const addItem = () => setItems((prev) => [...prev, newLineItem()])
  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!client.name.trim()) newErrors['client.name'] = t('errors.required')
    if (
      client.matriculeFiscal &&
      !validateMatriculeFiscal(client.matriculeFiscal)
    ) {
      newErrors['client.matriculeFiscal'] = t('errors.invalidMatricule')
    }
    if (
      seller.matriculeFiscal &&
      !validateMatriculeFiscal(seller.matriculeFiscal)
    ) {
      newErrors['seller.matriculeFiscal'] = t('errors.invalidMatricule')
    }
    if (!issueDate) newErrors['issueDate'] = t('errors.required')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildInvoice = (): Invoice => ({
    id: crypto.randomUUID(),
    number: invoiceNumber,
    status: 'draft',
    issueDate: new Date(issueDate),
    dueDate: dueDate ? new Date(dueDate) : new Date(issueDate),
    seller,
    client: { ...client, id: client.id || crypto.randomUUID() },
    items,
    totals,
    notes,
  })

  const handleSaveDraft = () => {
    if (!validate()) return
    addInvoice({ ...buildInvoice(), status: 'draft' })
    navigate('/invoices')
  }

  const handleEmit = async () => {
    if (!validate()) return
    setIsGeneratingPDF(true)
    try {
      const invoice: Invoice = { ...buildInvoice(), status: 'sent' }
      addInvoice(invoice)
      const { downloadInvoicePDF } = await import('../utils/generatePDF')
      await downloadInvoicePDF(invoice)
      navigate('/invoices')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('invoice.create')}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{invoiceNumber}</p>
        </div>
        <button
          onClick={() => navigate('/invoices')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← {t('buttons.back')}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — Client selector */}
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('invoice.client.title')}
          </h2>

          {/* Client selector row */}
          <Field
            label={t('invoice.client.select')}
            error={errors['client.name']}
            required
          >
            <div className="flex gap-2">
              <select
                className={`${inputClass} flex-1`}
                value={client.id}
                onChange={(e) => selectClient(e.target.value)}
              >
                <option value="">{t('invoice.client.selectPlaceholder')}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.matriculeFiscal ? ` — ${c.matriculeFiscal}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="flex-shrink-0 rounded-lg border border-primary-500 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                title={t('client.createNew')}
              >
                +
              </button>
            </div>
          </Field>

          {/* Auto-filled client preview */}
          {client.name && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800 space-y-1 text-sm">
              <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
              {client.address && (
                <p className="text-gray-500">{client.address}{client.city ? `, ${client.city}` : ''}</p>
              )}
              {client.phone && (
                <p className="text-gray-500" dir="ltr">{client.phone}</p>
              )}
              {client.email && (
                <p className="text-gray-500">{client.email}</p>
              )}
              {client.matriculeFiscal && (
                <p className="font-mono text-xs text-gray-500" dir="ltr">
                  MF : {client.matriculeFiscal}
                </p>
              )}
            </div>
          )}

          {/* Manual override fields (shown when no client selected or editing) */}
          {!client.id && (
            <>
              <Field label={t('invoice.client.name')} error={errors['client.name']} required>
                <input
                  className={inputClass}
                  placeholder={t('invoice.client.namePlaceholder')}
                  value={client.name}
                  onChange={(e) => updateClient('name', e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('invoice.client.email')}>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="email@exemple.tn"
                    value={client.email}
                    onChange={(e) => updateClient('email', e.target.value)}
                  />
                </Field>
                <Field label={t('invoice.client.phone')}>
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    value={client.phone}
                    onChange={(e) => updateClient('phone', e.target.value)}
                  />
                </Field>
              </div>
              <Field label={t('invoice.client.address')}>
                <input
                  className={inputClass}
                  value={client.address}
                  onChange={(e) => updateClient('address', e.target.value)}
                />
              </Field>
              <Field label={t('invoice.client.city')}>
                <input
                  className={inputClass}
                  value={client.city}
                  onChange={(e) => updateClient('city', e.target.value)}
                />
              </Field>
              <Field
                label={t('invoice.client.matriculeFiscal')}
                error={errors['client.matriculeFiscal']}
              >
                <input
                  className={inputClass}
                  placeholder={t('invoice.client.matriculePlaceholder')}
                  value={client.matriculeFiscal}
                  onChange={(e) => updateClient('matriculeFiscal', e.target.value)}
                  dir="ltr"
                />
              </Field>
            </>
          )}
        </section>

        {/* Right — Invoice details */}
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('invoice.create')}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label={t('invoice.issueDate')}
              error={errors['issueDate']}
              required
            >
              <input
                className={inputClass}
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                dir="ltr"
              />
            </Field>
            <Field label={t('invoice.dueDate')}>
              <input
                className={inputClass}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                dir="ltr"
              />
            </Field>
          </div>

          <Field
            label={t('invoice.sellerMatricule')}
            error={errors['seller.matriculeFiscal']}
          >
            <input
              className={inputClass}
              placeholder="1234567/A/P/000"
              value={seller.matriculeFiscal}
              onChange={(e) => {
                setSeller((prev) => ({ ...prev, matriculeFiscal: e.target.value }))
                setErrors((prev) => ({ ...prev, 'seller.matriculeFiscal': '' }))
              }}
              dir="ltr"
            />
          </Field>

          <Field label={t('invoice.notes')}>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder={t('invoice.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          {/* Totals summary */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('invoice.totals.totalHT')}</dt>
                <dd className="font-medium text-gray-900 dark:text-white" dir="ltr">
                  {formatCurrency(totals.totalHT, language)}
                </dd>
              </div>
              {totals.vatBreakdown.map((v) => (
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
                <dd className="font-bold text-primary-600" dir="ltr">
                  {formatCurrency(totals.totalTTC, language)}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      {/* Line items */}
      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('invoice.lines.title')}
          </h2>
          <button
            onClick={addItem}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <span aria-hidden="true">+</span>
            {t('invoice.lines.add')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr className="text-start text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 text-start">{t('invoice.lines.description')}</th>
                <th className="px-4 py-3 text-end w-20">{t('invoice.lines.quantity')}</th>
                <th className="px-4 py-3 text-end w-32">{t('invoice.lines.unitPrice')}</th>
                <th className="px-4 py-3 text-center w-24">{t('invoice.lines.vatRate')}</th>
                <th className="px-4 py-3 text-end w-28">{t('invoice.lines.totalHT')}</th>
                <th className="px-4 py-3 text-end w-28">{t('invoice.lines.totalTTC')}</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">
                    <input
                      className={inputClass}
                      placeholder={t('invoice.lines.descriptionPlaceholder')}
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, 'description', e.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className={`${inputClass} text-end`}
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', e.target.value)
                      }
                      dir="ltr"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className={`${inputClass} text-end`}
                      type="number"
                      min="0"
                      step="0.001"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, 'unitPrice', e.target.value)
                      }
                      dir="ltr"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className={inputClass}
                      value={item.vatRate}
                      onChange={(e) =>
                        updateItem(item.id, 'vatRate', Number(e.target.value))
                      }
                      dir="ltr"
                    >
                      {VAT_RATES.map((r) => (
                        <option key={String(r)} value={r}>
                          {vatLabel(r)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    className="px-4 py-2 text-end font-medium text-gray-700 dark:text-gray-300"
                    dir="ltr"
                  >
                    {formatCurrency(item.totalHT, language)}
                  </td>
                  <td
                    className="px-4 py-2 text-end font-semibold text-gray-900 dark:text-white"
                    dir="ltr"
                  >
                    {formatCurrency(item.totalTTC, language)}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 dark:hover:bg-red-900/20"
                      aria-label={t('invoice.lines.remove')}
                      title={t('invoice.lines.remove')}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => navigate('/invoices')}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {t('buttons.cancel')}
        </button>
        <button
          onClick={handleSaveDraft}
          className="rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
        >
          {t('invoice.saveDraft')}
        </button>
        <button
          onClick={() => {}}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
        >
          {t('invoice.preview')}
        </button>
        <button
          onClick={handleEmit}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
        >
          {isGeneratingPDF ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              {t('invoice.generating')}
            </>
          ) : (
            t('invoice.emit')
          )}
        </button>
      </div>

      {/* Quick-create client modal */}
      {showClientModal && (
        <ClientFormModal
          initial={null}
          onSave={handleQuickCreateClient}
          onClose={() => setShowClientModal(false)}
        />
      )}
    </div>
  )
}
