import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'
import { useProductStore } from '../stores/productStore'
import { ProductFormModal } from '../components/product/ProductFormModal'
import { formatCurrency, vatLabel } from '../utils/invoice'
import type { Product } from '../types/product'

type ModalMode = { type: 'closed' } | { type: 'create' } | { type: 'edit'; product: Product } | { type: 'delete'; product: Product }

export function ProductListPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalMode>({ type: 'closed' })

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  )

  const handleSave = (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (modal.type === 'edit') {
      updateProduct(modal.product.id, data)
    } else {
      addProduct(data)
    }
    setModal({ type: 'closed' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('product.title')}
        </h1>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <span aria-hidden="true">+</span>
          {t('product.new')}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full rounded-lg border border-gray-200 bg-white py-2 ps-9 pe-4 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder={t('product.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table / Empty state */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-5xl" aria-hidden="true">📦</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t('product.empty.title')}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {t('product.empty.description')}
              </p>
            </div>
            <button
              onClick={() => setModal({ type: 'create' })}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              {t('product.new')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">{t('product.noResults')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-start">{t('product.name')}</th>
                  <th className="px-4 py-3 text-start hidden md:table-cell">{t('product.description')}</th>
                  <th className="px-4 py-3 text-end">{t('product.unitPrice')}</th>
                  <th className="px-4 py-3 text-center">{t('product.vatRate')}</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">{t('product.unit')}</th>
                  <th className="px-4 py-3 text-center">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                      {product.description}
                    </td>
                    <td className="px-4 py-3 text-end font-semibold text-gray-900 dark:text-white" dir="ltr">
                      {formatCurrency(product.unitPrice, language)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-gray-700 dark:text-gray-300" dir="ltr">
                      {vatLabel(product.vatRate)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">
                      {t(`product.units.${product.unit}`)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModal({ type: 'edit', product })}
                          className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          {t('buttons.edit')}
                        </button>
                        <button
                          onClick={() => setModal({ type: 'delete', product })}
                          className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {t('buttons.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {(modal.type === 'create' || modal.type === 'edit') && (
        <ProductFormModal
          initial={modal.type === 'edit' ? modal.product : null}
          onSave={handleSave}
          onClose={() => setModal({ type: 'closed' })}
        />
      )}

      {/* Delete confirmation */}
      {modal.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('product.deleteConfirm.title')}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('product.deleteConfirm.message', { name: modal.product.name })}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setModal({ type: 'closed' })}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={() => {
                  deleteProduct(modal.product.id)
                  setModal({ type: 'closed' })
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {t('buttons.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
