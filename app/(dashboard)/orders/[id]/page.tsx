'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { PriorityBadge } from '@/components/orders/PriorityBadge'
import { PaymentBadge } from '@/components/orders/PaymentBadge'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { formatIDR, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { orders, loading } = useOrdersContext()
  const order = orders.find(o => o.id === id)

  if (loading) {
    return (
      <div>
        <TopBar title="Detail Pesanan" />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <TopBar title="Detail Pesanan" />
        <div className="p-8 text-center">
          <p className="text-gray-500">Pesanan tidak ditemukan.</p>
          <Button className="mt-4" onClick={() => router.push('/orders')}>Kembali ke Pesanan</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title={`Pesanan ${order.order_number}`} />
      <div className="p-8 max-w-2xl">
        <Button variant="outline" size="sm" onClick={() => router.push('/orders')} className="mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-sm text-gray-400">{order.order_number}</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-1">{order.client_name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <PriorityBadge priority={order.priority} />
              <PaymentBadge status={order.payment_status} />
            </div>
          </div>

          {order.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deskripsi</p>
              <p className="text-gray-700">{order.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Harga</p>
              <p className="font-semibold text-gray-900">{formatIDR(order.price)}</p>
            </div>
            {order.deposit_paid && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">DP Dibayar</p>
                <p className="font-semibold text-emerald-600">{formatIDR(order.deposit_amount)}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deadline</p>
              <p className="text-gray-700">{formatDate(order.deadline)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal Order</p>
              <p className="text-gray-700">{formatDate(order.order_date)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Link href={`/invoice/${order.id}`}>
              <Button>Generate Invoice</Button>
            </Link>
            <Link href={`/invoice/${order.id}?tab=whatsapp`}>
              <Button variant="outline">WhatsApp</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
