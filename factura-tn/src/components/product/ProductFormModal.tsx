import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Product } from '../../types/product'
import { PRODUCT_UNITS } from '../../types/product'
import { VAT_RATES, vatLabel } from '../../utils/invoice'
import type { VatRate } from '../../types/invoice'

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white'

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

interface ProductFormModalProps {
  initial?: Product | null
  onSave: (data: Omit<Product, 'id' | 'createdAt'>) => void
  onClose: () => void
}

export function ProductFormModal({ initial, onSave, onClose }: ProductFormModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [unitPrice, setUnitPrice] = useState(initial?.unitPrice ?? 0)
  const [vatRate, setVatRate] = useState<VatRate>(initial?.vatRate ?? 0.19)
  const [unit, setUnit] = useState(initial?.unit ?? 'unité')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('errors.required')
    if (unitPrice < 0) errs.unitPrice = t('errors.required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave({ name, description, unitPrice, vatRate, unit })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {initial ? t('product.edit') : t('product.create')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            aria-label={t('buttons.close')}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <Field label={t('product.name')} error={errors.name} required>
            <input
              className={inputClass}
              placeholder={t('product.namePlaceholder')}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              autoFocus
            />
          </Field>

          <Field label={t('product.description')}>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder={t('product.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('product.unitPrice')} error={errors.unitPrice} required>
              <input
                className={`${inputClass} text-end`}
                type="number"
                min="0"
                step="0.001"
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(Number(e.target.value))
                  setErrors((prev) => ({ ...prev, unitPrice: '' }))
                }}
                dir="ltr"
              />
            </Field>

            <Field label={t('product.vatRate')}>
              <select
                className={inputClass}
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value) as VatRate)}
                dir="ltr"
              >
                {VAT_RATES.map((r) => (
                  <option key={String(r)} value={r}>
                    {vatLabel(r)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={t('product.unit')}>
            <select
              className={inputClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {PRODUCT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {t(`product.units.${u}`)}
                </option>
              ))}
            </select>
          </Field>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              {t('buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
