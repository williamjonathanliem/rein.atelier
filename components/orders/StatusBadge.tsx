import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  revision: { label: 'Revision', className: 'bg-orange-100 text-orange-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  )
}
