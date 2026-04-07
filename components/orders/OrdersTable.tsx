'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal, FileText, MessageCircle, Edit, Trash2, LayoutGrid, Eye, ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { PaymentBadge } from './PaymentBadge'
import { AddOrderModal } from './AddOrderModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { formatIDR, formatDate, isOverdue, isDueSoon, cn } from '@/lib/utils'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

const PAGE_SIZE = 20

interface OrdersTableProps {
  onWhatsapp?: (order: Order) => void
}

export function OrdersTable({ onWhatsapp }: OrdersTableProps) {
  const router = useRouter()
  const { orders, loading, deleteOrder, updateStatus, updatePaymentStatus } = useOrdersContext()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      o.client_name.toLowerCase().includes(q) ||
      o.order_number.toLowerCase().includes(q) ||
      (o.description ?? '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchPriority = priorityFilter === 'all' || o.priority === priorityFilter
    const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter
    return matchSearch && matchStatus && matchPriority && matchPayment
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="revision">Revision</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={v => { setPaymentFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Link href="/kanban">
          <Button variant="outline" size="sm">
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </Button>
        </Link>
        <Button onClick={() => { setEditOrder(null); setAddOpen(true) }}>
          + Add Order
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ongkir</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <EmptyState
                      title={search || statusFilter !== 'all' || priorityFilter !== 'all' || paymentFilter !== 'all'
                        ? 'No orders match the current filters.'
                        : 'No orders yet. Add your first order! 🌸'}
                      action={orders.length === 0 ? (
                        <Button onClick={() => { setEditOrder(null); setAddOpen(true) }}>+ Add Order</Button>
                      ) : undefined}
                    />
                  </td>
                </tr>
              ) : (
                paginated.map(order => {
                  const overdue = isOverdue(order.deadline)
                  const soon = !overdue && isDueSoon(order.deadline)
                  const rowBg = overdue ? 'bg-red-50' : soon ? 'bg-amber-50' : ''
                  const isDelivery = order.delivery_type === 'delivery'
                  const shippingCost = order.shipping_cost ?? 0
                  const total = order.price + shippingCost

                  return (
                    <tr key={order.id} className={cn('border-b border-gray-50 hover:bg-gray-50/70 transition-colors', rowBg)}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <Link href={`/orders/${order.id}`} className="group">
                          <p className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors">{order.client_name}</p>
                          {order.client_phone && <p className="text-xs text-gray-400">{order.client_phone}</p>}
                        </Link>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-start gap-2">
                          {order.reference_image_url && (
                            <button
                              onClick={() => setLightboxUrl(order.reference_image_url!)}
                              className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-gray-200 hover:border-violet-400 hover:ring-2 hover:ring-violet-200 transition-all"
                              title="View reference picture"
                            >
                              <img src={order.reference_image_url} alt="Reference" className="w-full h-full object-cover" />
                            </button>
                          )}
                          <div className="min-w-0">
                            {order.product_type && (
                              <p className="text-xs font-medium text-violet-600 mb-0.5">{order.product_type}</p>
                            )}
                            <p className="text-gray-700 line-clamp-2 text-xs">{order.description || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatIDR(order.price)}</td>
                      <td className="px-4 py-3 text-right">
                        {isDelivery
                          ? <span className="text-sm text-gray-700">{formatIDR(shippingCost)}</span>
                          : <span className="inline-block bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-semibold">Ambil</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatIDR(total)}</td>
                      <td className={cn('px-4 py-3 text-sm', overdue ? 'text-red-600 font-medium' : soon ? 'text-amber-600 font-medium' : 'text-gray-600')}>
                        {formatDate(order.deadline)}
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priority={order.priority} /></td>
                      {/* Inline status edit */}
                      <td className="px-4 py-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="cursor-pointer hover:opacity-80 transition-opacity">
                              <StatusBadge status={order.status} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-44 p-1">
                            {(['pending', 'in_progress', 'revision', 'completed', 'cancelled'] as OrderStatus[]).map(s => (
                              <button key={s} className="w-full text-left px-2 py-1.5 rounded-lg text-sm hover:bg-violet-50 flex items-center gap-2" onClick={() => updateStatus(order.id, s)}>
                                <StatusBadge status={s} />
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </td>
                      {/* Inline payment edit */}
                      <td className="px-4 py-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="cursor-pointer hover:opacity-80 transition-opacity">
                              <PaymentBadge status={order.payment_status} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-36 p-1">
                            {(['unpaid', 'partial', 'paid'] as PaymentStatus[]).map(s => (
                              <button key={s} className="w-full text-left px-2 py-1.5 rounded-lg text-sm hover:bg-violet-50 flex items-center gap-2" onClick={() => updatePaymentStatus(order.id, s)}>
                                <PaymentBadge status={s} />
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditOrder(order); setAddOpen(true) }}>
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/invoice/${order.id}`)}>
                              <FileText className="h-3.5 w-3.5" /> Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onWhatsapp?.(order)}>
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteId(order.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              {filtered.length} orders · Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1
                return (
                  <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="w-8 px-0">{p}</Button>
                )
              })}
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Button>
            </div>
          </div>
        )}
      </div>

      <AddOrderModal
        open={addOpen}
        onOpenChange={open => { setAddOpen(open); if (!open) setEditOrder(null) }}
        editOrder={editOrder}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => { if (!open) setDeleteId(null) }}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteId) deleteOrder(deleteId) }}
        destructive
      />

      {/* Reference image lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={open => { if (!open) setLightboxUrl(null) }}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-0">
          {lightboxUrl && <img src={lightboxUrl} alt="Reference" className="w-full h-auto max-h-[85vh] object-contain rounded" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
