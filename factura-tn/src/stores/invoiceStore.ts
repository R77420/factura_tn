import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice } from '../types/invoice'
import { generateInvoiceNumber } from '../utils/invoice'

interface InvoiceState {
  invoices: Invoice[]
  lastInvoiceNumber: number
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  getNextInvoiceNumber: () => string
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],
      lastInvoiceNumber: 0,

      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [invoice, ...state.invoices],
          lastInvoiceNumber: state.lastInvoiceNumber + 1,
        })),

      updateInvoice: (id, patch) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...patch } : inv
          ),
        })),

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      getNextInvoiceNumber: () =>
        generateInvoiceNumber(get().lastInvoiceNumber),
    }),
    {
      name: 'factura-tn-invoices',
      // Dates are serialized as strings in localStorage — rehydrate them
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.invoices = state.invoices.map((inv) => ({
          ...inv,
          issueDate: new Date(inv.issueDate),
          dueDate: new Date(inv.dueDate),
        }))
      },
    }
  )
)
