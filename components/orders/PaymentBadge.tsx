import { cn } from '@/lib/utils'
import type { PaymentStatus } from '@/types'

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Partial', className: 'bg-amber-100 text-amber-700' },
  unpaid: { label: 'Unpaid', className: 'bg-red-100 text-red-600' },
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  )
}
