'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatIDR, cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

interface KanbanColumnProps {
  status: OrderStatus
  orders: Order[]
  onEdit: (order: Order) => void
  onAdd?: () => void
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  revision: 'Revision',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const COLUMN_ACCENT: Record<OrderStatus, string> = {
  pending: 'border-t-amber-300',
  in_progress: 'border-t-blue-300',
  revision: 'border-t-orange-300',
  completed: 'border-t-emerald-300',
  cancelled: 'border-t-gray-300',
}

export function KanbanColumn({ status, orders, onEdit, onAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const total = orders.reduce((sum, o) => sum + (o.price ?? 0), 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col min-h-[400px] w-64 shrink-0 border-t-2',
        COLUMN_ACCENT[status],
        isOver && 'bg-violet-50/50 border-violet-200'
      )}
    >
      {/* Column header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={status} />
          <span className="text-xs text-gray-500">
            {orders.length} orders
          </span>
        </div>
        <p className="text-xs text-gray-400">{formatIDR(total)}</p>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
        <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
          {orders.map(order => (
            <KanbanCard key={order.id} order={order} onEdit={onEdit} />
          ))}
        </SortableContext>
      </div>

      {/* Add button for Pending column */}
      {status === 'pending' && onAdd && (
        <div className="p-3 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full text-gray-400 hover:text-violet-600 hover:bg-violet-50 gap-1.5 text-sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            Add Order
          </Button>
        </div>
      )}
    </div>
  )
}
