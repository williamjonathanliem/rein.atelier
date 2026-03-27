'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { generateOrderNumber } from '@/lib/utils'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data ?? [])
      } catch (err: any) {
        const msg = 'Gagal memuat pesanan: ' + err.message
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const addOrder = useCallback(async (
    data: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
  ): Promise<Order | null> => {
    try {
      const { data: prefixData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'order_number_prefix')
        .single()

      const prefix = prefixData?.value ?? 'ORD-'
      const order_number = await generateOrderNumber(supabase, prefix)

      const { data: inserted, error } = await supabase
        .from('orders')
        .insert({ ...data, order_number })
        .select()
        .single()

      if (error) throw error
      setOrders(prev => [inserted, ...prev])
      toast.success('Pesanan berhasil ditambahkan! 🌸')
      return inserted
    } catch (err: any) {
      toast.error('Gagal menambah pesanan: ' + err.message)
      return null
    }
  }, [])

  const updateOrder = useCallback(async (id: string, data: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update(data)
        .eq('id', id)

      if (error) throw error
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, ...data } : o))
      )
      toast.success('Pesanan diperbarui!')
    } catch (err: any) {
      toast.error('Gagal memperbarui pesanan: ' + err.message)
    }
  }, [])

  const deleteOrder = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) throw error
      setOrders(prev => prev.filter(o => o.id !== id))
      toast.success('Pesanan dihapus!')
    } catch (err: any) {
      toast.error('Gagal menghapus pesanan: ' + err.message)
    }
  }, [])

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status } : o))
      )
    } catch (err: any) {
      toast.error('Gagal mengubah status: ' + err.message)
    }
  }, [])

  const updatePaymentStatus = useCallback(async (id: string, payment_status: PaymentStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status })
        .eq('id', id)

      if (error) throw error
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, payment_status } : o))
      )
    } catch (err: any) {
      toast.error('Gagal mengubah status pembayaran: ' + err.message)
    }
  }, [])

  return {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    updatePaymentStatus,
  }
}
