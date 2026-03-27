'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { useAlerts } from '@/hooks/useAlerts'
import { formatDate } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  const { orders } = useOrdersContext()
  const alerts = useAlerts(orders)

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between px-8 h-14">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <Popover>
        <PopoverTrigger asChild>
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-500" />
            {alerts.total > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-sm text-gray-900">Notifikasi Deadline</p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {alerts.total === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                All clear! 🌸
              </div>
            ) : (
              <>
                {alerts.overdue.map(order => (
                  <Link
                    key={order.id}
                    href="/orders"
                    className="flex items-start gap-3 px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-50"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {order.client_name}
                      </p>
                      <p className="text-xs text-red-500">
                        Terlambat · {formatDate(order.deadline)}
                      </p>
                    </div>
                  </Link>
                ))}
                {alerts.dueSoon.map(order => (
                  <Link
                    key={order.id}
                    href="/orders"
                    className="flex items-start gap-3 px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-50"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {order.client_name}
                      </p>
                      <p className="text-xs text-amber-600">
                        Segera · {formatDate(order.deadline)}
                      </p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
