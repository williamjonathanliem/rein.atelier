'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ZoomIn } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { PriorityBadge } from '@/components/orders/PriorityBadge'
import { PaymentBadge } from '@/components/orders/PaymentBadge'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { formatIDR, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { orders, loading } = useOrdersContext()
  const [showRefImage, setShowRefImage] = useState(false)
  const order = orders.find(o => o.id === id)

  if (loading) {
    return (
      <div>
        <TopBar title="Order Details" />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <TopBar title="Order Details" />
        <div className="p-8 text-center">
          <p className="text-gray-500">Order not found.</p>
          <Button className="mt-4" onClick={() => router.push('/orders')}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title={`Order ${order.order_number}`} />
      <div className="p-8 max-w-2xl">
        <Button variant="outline" size="sm" onClick={() => router.push('/orders')} className="mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
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

          {order.product_type && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Product Type</p>
              <p className="text-violet-600 font-medium">{order.product_type}</p>
            </div>
          )}

          {order.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-gray-700">{order.description}</p>
            </div>
          )}

          {order.reference_image_url && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reference Picture</p>
              <div
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-sm"
                style={{ aspectRatio: '4/3' }}
                onClick={() => setShowRefImage(true)}
              >
                <img
                  src={order.reference_image_url}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <ZoomIn className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">View full size</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price</p>
              <p className="font-semibold text-gray-900">{formatIDR(order.price)}</p>
            </div>
            {order.deposit_paid && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payed DP</p>
                <p className="font-semibold text-emerald-600">{formatIDR(order.deposit_amount)}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deadline</p>
              <p className="text-gray-700">{formatDate(order.deadline)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Order Placed</p>
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

      {/* Reference image lightbox */}
      {order.reference_image_url && (
        <Dialog open={showRefImage} onOpenChange={setShowRefImage}>
          <DialogContent className="max-w-4xl p-2 bg-black/95 border-0">
            <img
              src={order.reference_image_url}
              alt="Reference"
              className="w-full h-auto max-h-[85vh] object-contain rounded"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
