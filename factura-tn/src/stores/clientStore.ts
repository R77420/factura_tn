import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Client } from '../types/client'

interface ClientState {
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client
  updateClient: (id: string, patch: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void
  deleteClient: (id: string) => void
  getClientById: (id: string) => Client | undefined
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (data) => {
        const now = new Date()
        const client: Client = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ clients: [client, ...state.clients] }))
        return client
      },

      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      getClientById: (id) => get().clients.find((c) => c.id === id),
    }),
    {
      name: 'factura-tn-clients',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.clients = state.clients.map((c) => ({
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
        }))
      },
    }
  )
)
