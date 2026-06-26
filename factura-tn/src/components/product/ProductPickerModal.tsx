import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../hooks/useLanguage'
import { useProductStore } from '../../stores/productStore'
import { formatCurrency, vatLabel } from '../../utils/invoice'
import type { Product } from '../../types/product'

interface ProductPickerModalProps {
  onSelect: (product: Product) => void
  onClose: () => void
}

export function ProductPickerModal({ onSelect, onClose }: ProductPickerModalProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const products = useProductStore((s) => s.products)
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('product.picker.title')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            aria-label={t('buttons.close')}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          <input
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder={t('product.picker.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-gray-400">
                {products.length === 0
                  ? t('product.picker.noProducts')
                  : t('product.picker.noResults')}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => onSelect(product)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-3 text-start hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="truncate text-xs text-gray-400">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-end">
                      <p className="text-sm font-semibold text-primary-600" dir="ltr">
                        {formatCurrency(product.unitPrice, language)}
                      </p>
                      <p className="text-xs text-gray-400" dir="ltr">
                        {vatLabel(product.vatRate)} · {t(`product.units.${product.unit}`)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
