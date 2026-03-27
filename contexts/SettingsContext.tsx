'use client'

import { createContext, useContext } from 'react'
import { useSettings } from '@/hooks/useSettings'
import type { Settings } from '@/types'

interface SettingsContextType {
  settings: Settings
  loading: boolean
  getSetting: (key: string) => string
  updateSetting: (key: string, value: string) => Promise<void>
  updateSettings: (updates: Settings) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  loading: true,
  getSetting: () => '',
  updateSetting: async () => {},
  updateSettings: async () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const value = useSettings()
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext() {
  return useContext(SettingsContext)
}
