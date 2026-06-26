import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Client } from '../../types/client'
import { validateMatriculeFiscal } from '../../utils/invoice'

type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>

const EMPTY_FORM: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  matriculeFiscal: '',
}

interface ClientFormModalProps {
  initial?: Client | null
  onSave: (data: ClientFormData) => void
  onClose: () => void
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, error, required, children }: FieldProps) {
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

export function ClientFormModal({ initial, onSave, onClose }: ClientFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!initial

  const [form, setForm] = useState<ClientFormData>(
    initial
      ? {
          name: initial.name,
          email: initial.email,
          phone: initial.phone,
          address: initial.address,
          city: initial.city,
          matriculeFiscal: initial.matriculeFiscal,
        }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({})

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (field: keyof ClientFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof ClientFormData, string>> = {}
    if (!form.name.trim()) e.name = t('errors.required')
    if (form.matriculeFiscal && !validateMatriculeFiscal(form.matriculeFiscal))
      e.matriculeFiscal = t('errors.invalidMatricule')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (validate()) onSave(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? t('client.edit') : t('client.create')}
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
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 px-6 py-5">
            <Field label={t('client.name')} error={errors.name} required>
              <input
                className={inputClass}
                placeholder={t('client.namePlaceholder')}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                autoFocus
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t('client.email')}>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="email@exemple.tn"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <Field label={t('client.phone')}>
                <input
                  className={inputClass}
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </Field>
            </div>

            <Field label={t('client.address')}>
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </Field>

            <Field label={t('client.city')}>
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </Field>

            <Field
              label={t('client.matriculeFiscal')}
              error={errors.matriculeFiscal}
            >
              <input
                className={inputClass}
                placeholder="1234567/A/P/000"
                value={form.matriculeFiscal}
                onChange={(e) => set('matriculeFiscal', e.target.value)}
                dir="ltr"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
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
