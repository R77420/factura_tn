import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../stores/settingsStore'
import { validateMatriculeFiscal } from '../utils/invoice'

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white'

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
  hint?: string
}

function Field({ label, error, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
    </h2>
  )
}

export function SettingsPage() {
  const { t } = useTranslation()
  const settings = useSettingsStore()
  const { updateSettings } = useSettingsStore()

  const [name, setName] = useState(settings.name)
  const [address, setAddress] = useState(settings.address)
  const [city, setCity] = useState(settings.city)
  const [phone, setPhone] = useState(settings.phone)
  const [email, setEmail] = useState(settings.email)
  const [matriculeFiscal, setMatriculeFiscal] = useState(settings.matriculeFiscal)
  const [rib, setRib] = useState(settings.rib ?? '')
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix)
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoiceFooter)
  const [logo, setLogo] = useState(settings.logo)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogo(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('errors.required')
    if (matriculeFiscal && !validateMatriculeFiscal(matriculeFiscal))
      errs.matriculeFiscal = t('errors.invalidMatricule')
    if (!invoicePrefix.trim()) errs.invoicePrefix = t('errors.required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    updateSettings({
      name,
      address,
      city,
      phone,
      email,
      matriculeFiscal,
      rib,
      invoicePrefix: invoicePrefix.trim().toUpperCase(),
      invoiceFooter,
      logo,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* ── Company info ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5 dark:border-gray-800 dark:bg-gray-900">
        <SectionTitle>{t('settings.company.title')}</SectionTitle>

        <Field label={t('settings.company.name')} error={errors.name}>
          <input
            className={inputClass}
            placeholder={t('settings.company.namePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setErrors((p) => ({ ...p, name: '' }))
            }}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('settings.company.email')}>
            <input
              className={inputClass}
              type="email"
              placeholder="contact@entreprise.tn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={t('settings.company.phone')}>
            <input
              className={inputClass}
              type="tel"
              placeholder="+216 71 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </Field>
        </div>

        <Field label={t('settings.company.address')}>
          <input
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>

        <Field label={t('settings.company.city')}>
          <input
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field>

        <Field label={t('settings.company.matriculeFiscal')} error={errors.matriculeFiscal}>
          <input
            className={inputClass}
            placeholder="1234567/A/P/000"
            value={matriculeFiscal}
            onChange={(e) => {
              setMatriculeFiscal(e.target.value)
              setErrors((p) => ({ ...p, matriculeFiscal: '' }))
            }}
            dir="ltr"
          />
        </Field>

        <Field label={t('settings.company.rib')} hint={t('settings.company.ribHint')}>
          <input
            className={inputClass}
            placeholder="TN59 XXXX XXXX XXXX XXXX XXXX"
            value={rib}
            onChange={(e) => setRib(e.target.value)}
            dir="ltr"
          />
        </Field>
      </section>

      {/* ── Logo ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-800 dark:bg-gray-900">
        <SectionTitle>{t('settings.logo.title')}</SectionTitle>

        {logo ? (
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Logo"
              className="h-20 w-40 rounded-lg border border-gray-200 object-contain p-2 dark:border-gray-700"
            />
            <div className="space-y-2">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="block text-sm text-primary-600 hover:underline"
              >
                {t('settings.logo.change')}
              </button>
              <button
                onClick={() => setLogo(undefined)}
                className="block text-sm text-red-500 hover:underline"
              >
                {t('settings.logo.remove')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-primary-400 hover:text-primary-500 dark:border-gray-700"
          >
            {t('settings.logo.upload')}
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
        <p className="text-xs text-gray-400">{t('settings.logo.hint')}</p>
      </section>

      {/* ── Invoice appearance ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5 dark:border-gray-800 dark:bg-gray-900">
        <SectionTitle>{t('settings.invoice.title')}</SectionTitle>

        <Field
          label={t('settings.invoice.prefix')}
          error={errors.invoicePrefix}
          hint={t('settings.invoice.prefixHint')}
        >
          <input
            className={`${inputClass} uppercase`}
            placeholder="FAC"
            value={invoicePrefix}
            onChange={(e) => {
              setInvoicePrefix(e.target.value.toUpperCase())
              setErrors((p) => ({ ...p, invoicePrefix: '' }))
            }}
            dir="ltr"
            maxLength={6}
          />
        </Field>

        <Field
          label={t('settings.invoice.footer')}
          hint={t('settings.invoice.footerHint')}
        >
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder={t('settings.invoice.footerPlaceholder')}
            value={invoiceFooter}
            onChange={(e) => setInvoiceFooter(e.target.value)}
          />
        </Field>
      </section>

      {/* Save button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            ✓ {t('settings.saved')}
          </span>
        )}
        <button
          onClick={handleSave}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          {t('buttons.save')}
        </button>
      </div>
    </div>
  )
}
