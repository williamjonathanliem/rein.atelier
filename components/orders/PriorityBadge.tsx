import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-500' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-600' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-600' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority] ?? { label: priority, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  )
}
