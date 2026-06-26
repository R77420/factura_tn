import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Client } from '../types/client'
import { useClientStore } from '../stores/clientStore'
import { ClientFormModal } from '../components/client/ClientFormModal'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; client: Client }
  | { mode: 'delete'; client: Client }

export function ClientListPage() {
  const { t } = useTranslation()
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase()
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.matriculeFiscal.toLowerCase().includes(q)
    )
  }, [clients, search])

  const handleSave = (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (modal.mode === 'create') {
      addClient(data)
    } else if (modal.mode === 'edit') {
      updateClient(modal.client.id, data)
    }
    setModal({ mode: 'closed' })
  }

  const handleDelete = () => {
    if (modal.mode === 'delete') {
      deleteClient(modal.client.id)
      setModal({ mode: 'closed' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('client.title')}
        </h1>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <span aria-hidden="true">+</span>
          {t('client.new')}
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          className="w-full rounded-lg border border-gray-200 bg-white py-2 ps-9 pe-4 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder={t('client.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table / Empty state */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white py-20 dark:border-gray-700 dark:bg-gray-900">
          <span className="text-5xl" aria-hidden="true">👥</span>
          <div className="text-center">
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {t('client.empty.title')}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t('client.empty.description')}
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            {t('client.new')}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-gray-400">{t('client.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 dark:border-gray-800">
                  <tr className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 text-start">{t('client.name')}</th>
                    <th className="px-4 py-3 text-start">{t('client.email')}</th>
                    <th className="px-4 py-3 text-start">{t('client.phone')}</th>
                    <th className="px-4 py-3 text-start">{t('client.city')}</th>
                    <th className="px-4 py-3 text-start">{t('client.matriculeFiscal')}</th>
                    <th className="px-4 py-3 text-center">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {client.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500" dir="ltr">
                        {client.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {client.city || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500" dir="ltr">
                        {client.matriculeFiscal || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setModal({ mode: 'edit', client })}
                            className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          >
                            {t('buttons.edit')}
                          </button>
                          <button
                            onClick={() => setModal({ mode: 'delete', client })}
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
      )}

      {/* Create / Edit modal */}
      {(modal.mode === 'create' || modal.mode === 'edit') && (
        <ClientFormModal
          initial={modal.mode === 'edit' ? modal.client : null}
          onSave={handleSave}
          onClose={() => setModal({ mode: 'closed' })}
        />
      )}

      {/* Delete confirmation modal */}
      {modal.mode === 'delete' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setModal({ mode: 'closed' })}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('client.deleteConfirm.title')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {t('client.deleteConfirm.message', { name: modal.client.name })}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setModal({ mode: 'closed' })}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={handleDelete}
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
