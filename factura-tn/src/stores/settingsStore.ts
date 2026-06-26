import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CompanySettings } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'

interface SettingsState extends CompanySettings {
  updateSettings: (patch: Partial<CompanySettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (patch) => set((state) => ({ ...state, ...patch })),
    }),
    { name: 'factura-tn-settings' }
  )
)
