'use client'

import { useMemo } from 'react'
import type { Order, AlertCounts } from '@/types'
import { isOverdue, isDueSoon } from '@/lib/utils'

export function useAlerts(orders: Order[]): AlertCounts {
  return useMemo(() => {
    const overdue = orders.filter(
      o => !['completed', 'cancelled'].includes(o.status) && isOverdue(o.deadline)
    )
    const dueSoon = orders.filter(
      o => !['completed', 'cancelled'].includes(o.status) && isDueSoon(o.deadline)
    )
    return { overdue, dueSoon, total: overdue.length + dueSoon.length }
  }, [orders])
}
