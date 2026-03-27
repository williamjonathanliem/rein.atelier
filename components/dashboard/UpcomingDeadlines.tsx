'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { PriorityBadge } from '@/components/orders/PriorityBadge'
import { Button } from '@/components/ui/button'
import { formatDate, isOverdue, isDueSoon, daysUntil, cn } from '@/lib/utils'
import type { Order } from '@/types'

export function UpcomingDeadlines({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">Deadline Mendekat</p>
        <Link href="/orders" className="text-xs text-violet-600 hover:text-violet-800 font-medium">Lihat semua →</Link>
      </div>
      {orders.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          Tidak ada deadline yang mendekat. 🌸
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">No. Order</th>
                <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Klien</th>
                <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deskripsi</th>
                <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioritas</th>
                <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const overdue = isOverdue(order.deadline)
                const soon = !overdue && isDueSoon(order.deadline)
                const days = daysUntil(order.deadline)
                const rowBg = overdue ? 'bg-red-50' : soon ? 'bg-amber-50' : ''

                return (
                  <tr key={order.id} className={cn('border-b border-gray-50', rowBg)}>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{order.order_number}</td>
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{order.client_name}</td>
                    <td className="py-2.5 pr-4 text-gray-600 max-w-[160px] truncate text-xs">
                      {(order.description ?? '').slice(0, 40) || '—'}
                    </td>
                    <td className={cn('py-2.5 pr-4 text-sm font-medium', overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-gray-600')}>
                      <div>{formatDate(order.deadline)}</div>
                      <div className="text-xs font-normal">
                        {overdue ? `${Math.abs(days)} hari lalu` : days === 0 ? 'Hari ini!' : `${days} hari lagi`}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4"><PriorityBadge priority={order.priority} /></td>
                    <td className="py-2.5 pr-4"><StatusBadge status={order.status} /></td>
                    <td className="py-2.5">
                      <Link href={`/invoice/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <FileText className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
