'use client'

import { createContext, useContext } from 'react'
import { useOrders } from '@/hooks/useOrders'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

interface OrdersContextType {
  orders: Order[]
  loading: boolean
  error: string | null
  addOrder: (data: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => Promise<Order | null>
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  updateStatus: (id: string, status: OrderStatus) => Promise<void>
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  loading: true,
  error: null,
  addOrder: async () => null,
  updateOrder: async () => {},
  deleteOrder: async () => {},
  updateStatus: async () => {},
  updatePaymentStatus: async () => {},
})

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const value = useOrders()
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrdersContext() {
  return useContext(OrdersContext)
}
