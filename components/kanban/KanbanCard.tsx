'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal, FileText, Edit, Calendar } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PriorityBadge } from '@/components/orders/PriorityBadge'
import { Button } from '@/components/ui/button'
import { formatDate, formatIDR, isOverdue, isDueSoon, cn } from '@/lib/utils'
import type { Order } from '@/types'

interface KanbanCardProps {
  order: Order
  onEdit: (order: Order) => void
}

export function KanbanCard({ order, onEdit }: KanbanCardProps) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const overdue = isOverdue(order.deadline)
  const soon = !overdue && isDueSoon(order.deadline)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-3 shadow-sm cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg',
        overdue && 'border-l-2 border-l-red-400',
        soon && !overdue && 'border-l-2 border-l-amber-400'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-xs text-gray-400">{order.order_number}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-0.5"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(order)}>
              <Edit className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/invoice/${order.id}`)}>
              <FileText className="h-3.5 w-3.5" /> Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="font-semibold text-gray-900 text-sm mb-0.5">{order.client_name}</p>
      {order.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{order.description}</p>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={order.priority} />
          <div className={cn(
            'flex items-center gap-1 text-xs',
            overdue ? 'text-red-500' : soon ? 'text-amber-500' : 'text-gray-400'
          )}>
            <Calendar className="h-3 w-3" />
            {formatDate(order.deadline, 'dd MMM')}
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-700">{formatIDR(order.price)}</span>
      </div>
    </div>
  )
}
