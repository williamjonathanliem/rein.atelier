'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ZoomIn, FileText, MessageCircle, Edit,
  Phone, Mail, MapPin, Clock, CalendarDays, Pencil, StickyNote,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { PriorityBadge } from '@/components/orders/PriorityBadge'
import { PaymentBadge } from '@/components/orders/PaymentBadge'
import { AddOrderModal } from '@/components/orders/AddOrderModal'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { formatIDR, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function Field({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  if (!value) return null
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-gray-800 text-sm">{value}</p>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { orders, loading } = useOrdersContext()
  const [showRefImage, setShowRefImage] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

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

  const remaining = order.price - (order.deposit_paid ? order.deposit_amount : 0)

  return (
    <div>
      <TopBar title={`Order ${order.order_number}`} />

      <div className="p-6 max-w-5xl">
        {/* Back */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs text-gray-400 mb-1">{order.order_number}</p>
              <h1 className="text-2xl font-bold text-gray-900">{order.client_name}</h1>
              {order.product_type && (
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
                  {order.product_type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={order.status} />
              <PriorityBadge priority={order.priority} />
              <PaymentBadge status={order.payment_status} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="h-3.5 w-3.5" /> Edit Order
            </Button>
            <Link href={`/invoice/${order.id}`}>
              <Button size="sm">
                <FileText className="h-3.5 w-3.5" /> Generate Invoice
              </Button>
            </Link>
            <Link href={`/invoice/${order.id}?tab=whatsapp`}>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </Button>
            </Link>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT — Product & visuals */}
          <div className="flex flex-col gap-4">

            {/* Description */}
            {order.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order Description</p>
                <p className="text-gray-800 text-sm leading-relaxed">{order.description}</p>
              </div>
            )}

            {/* Reference picture */}
            {order.reference_image_url && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Reference Picture</p>
                <div
                  className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
                  onClick={() => setShowRefImage(true)}
                >
                  <img
                    src={order.reference_image_url}
                    alt="Reference"
                    className="w-full object-cover max-h-72"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <ZoomIn className="h-5 w-5 text-white" />
                    <span className="text-white text-sm font-medium">View full size</span>
                  </div>
                </div>
              </div>
            )}

            {/* Handwritten note */}
            {order.handwritten_note && (
              <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Pencil className="h-3.5 w-3.5 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Handwritten Note</p>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-[cursive] text-base">
                  {order.handwritten_note}
                </p>
              </div>
            )}

            {/* Internal notes */}
            {order.notes && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Internal Notes</p>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          {/* RIGHT — Order info */}
          <div className="flex flex-col gap-4">

            {/* Client contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Client</p>
              <div className="flex flex-col gap-2.5">
                {order.client_phone && (
                  <a
                    href={`https://wa.me/${order.client_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {order.client_phone}
                  </a>
                )}
                {order.client_email && (
                  <a
                    href={`mailto:${order.client_email}`}
                    className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-violet-600 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {order.client_email}
                  </a>
                )}
                {order.client_address && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{order.client_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dates & Time</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarDays className="h-3 w-3 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Order Date</p>
                  </div>
                  <p className="text-sm text-gray-800">{formatDate(order.order_date)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarDays className="h-3 w-3 text-red-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Deadline</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(order.deadline)}</p>
                </div>
                {order.delivery_time && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Delivery Time</p>
                    </div>
                    <p className="text-sm text-gray-800">{order.delivery_time}</p>
                  </div>
                )}
                {order.due_date && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <CalendarDays className="h-3 w-3 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Due Date</p>
                    </div>
                    <p className="text-sm text-gray-800">{formatDate(order.due_date)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financials */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payment</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Price</span>
                  <span className="text-sm font-bold text-gray-900">{formatIDR(order.price)}</span>
                </div>
                {order.deposit_paid && order.deposit_amount > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Deposit Paid</span>
                      <span className="text-sm font-medium text-emerald-600">− {formatIDR(order.deposit_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">Remaining</span>
                      <span className={cn('text-sm font-bold', remaining > 0 ? 'text-orange-600' : 'text-emerald-600')}>
                        {formatIDR(remaining)}
                      </span>
                    </div>
                  </>
                )}
                <div className="pt-2">
                  <PaymentBadge status={order.payment_status} />
                </div>
              </div>
            </div>
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

      <AddOrderModal
        open={editOpen}
        onOpenChange={setEditOpen}
        editOrder={order}
      />
    </div>
  )
}
