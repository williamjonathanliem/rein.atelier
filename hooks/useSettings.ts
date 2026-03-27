'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Settings } from '@/types'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')

        if (error) throw error

        const map: Settings = {}
        for (const row of data ?? []) {
          map[row.key] = row.value ?? ''
        }
        setSettings(map)
      } catch (err: any) {
        toast.error('Gagal memuat pengaturan: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const getSetting = useCallback(
    (key: string): string => settings[key] ?? '',
    [settings]
  )

  const updateSetting = useCallback(async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

      if (error) throw error
      setSettings(prev => ({ ...prev, [key]: value }))
    } catch (err: any) {
      toast.error('Gagal menyimpan pengaturan: ' + err.message)
    }
  }, [])

  const updateSettings = useCallback(async (updates: Settings) => {
    try {
      const rows = Object.entries(updates).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('settings')
        .upsert(rows, { onConflict: 'key' })

      if (error) throw error
      setSettings(prev => ({ ...prev, ...updates }))
      toast.success('Pengaturan berhasil disimpan!')
    } catch (err: any) {
      toast.error('Gagal menyimpan pengaturan: ' + err.message)
    }
  }, [])

  return { settings, loading, getSetting, updateSetting, updateSettings }
}
