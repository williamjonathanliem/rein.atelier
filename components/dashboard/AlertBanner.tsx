'use client'

import Link from 'next/link'
import { AlertTriangle, Clock } from 'lucide-react'
import type { AlertCounts } from '@/types'

export function AlertBanner({ alerts }: { alerts: AlertCounts }) {
  if (alerts.total === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.overdue.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 font-medium">
            🔴 <strong>{alerts.overdue.length}</strong> pesanan sudah melewati deadline!
          </span>
          <Link href="/orders" className="ml-auto text-sm text-red-600 hover:text-red-800 font-semibold whitespace-nowrap">
            Lihat Pesanan →
          </Link>
        </div>
      )}
      {alerts.dueSoon.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm text-amber-700 font-medium">
            🟡 <strong>{alerts.dueSoon.length}</strong> pesanan deadline dalam 3 hari ke depan.
          </span>
          <Link href="/orders" className="ml-auto text-sm text-amber-600 hover:text-amber-800 font-semibold whitespace-nowrap">
            Lihat Pesanan →
          </Link>
        </div>
      )}
    </div>
  )
}
