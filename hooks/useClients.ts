'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/types'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setClients(data ?? [])
      } catch (err: any) {
        toast.error('Gagal memuat klien: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const addClient = useCallback(async (
    data: Omit<Client, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Client | null> => {
    try {
      const { data: inserted, error } = await supabase
        .from('clients')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      setClients(prev => [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Klien berhasil ditambahkan!')
      return inserted
    } catch (err: any) {
      toast.error('Gagal menambah klien: ' + err.message)
      return null
    }
  }, [])

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)

      if (error) throw error
      setClients(prev =>
        prev.map(c => (c.id === id ? { ...c, ...data } : c))
      )
      toast.success('Klien diperbarui!')
    } catch (err: any) {
      toast.error('Gagal memperbarui klien: ' + err.message)
    }
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClients(prev => prev.filter(c => c.id !== id))
      toast.success('Klien dihapus!')
    } catch (err: any) {
      toast.error('Gagal menghapus klien: ' + err.message)
    }
  }, [])

  return { clients, loading, addClient, updateClient, deleteClient }
}
