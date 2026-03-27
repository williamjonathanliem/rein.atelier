'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, format,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { parseLocalDate, cn } from '@/lib/utils'

const STATUS_BG: Record<string, string> = {
  pending: 'bg-amber-200 text-amber-800',
  in_progress: 'bg-blue-200 text-blue-800',
  revision: 'bg-orange-200 text-orange-800',
  completed: 'bg-emerald-200 text-emerald-800',
  cancelled: 'bg-gray-200 text-gray-600',
}

export function CalendarView() {
  const router = useRouter()
  const { orders } = useOrdersContext()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getOrdersForDay = (date: Date) => {
    return orders.filter(o => {
      const d = parseLocalDate(o.deadline)
      return isSameDay(d, date)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold text-gray-900 w-40 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
          Hari Ini
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const dayOrders = getOrdersForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, today)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[96px] p-2 border-b border-r border-gray-50 relative',
                !isCurrentMonth && 'bg-gray-50/50',
                isToday && 'bg-violet-50 ring-1 ring-inset ring-violet-300'
              )}
            >
              <div className={cn(
                'text-sm font-medium mb-1',
                isToday ? 'text-violet-700' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
              )}>
                {format(day, 'd')}
              </div>

              <div className="flex flex-col gap-1 overflow-hidden">
                {dayOrders.slice(0, 3).map(order => (
                  <Popover key={order.id}>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          'w-full text-left text-xs px-1.5 py-0.5 rounded-md truncate font-medium',
                          STATUS_BG[order.status] ?? 'bg-gray-200 text-gray-700'
                        )}
                      >
                        {order.client_name}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400">{order.order_number}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="font-semibold text-gray-900">{order.client_name}</p>
                        {order.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{order.description}</p>
                        )}
                        <p className="text-xs text-gray-500">Deadline: {format(parseLocalDate(order.deadline), 'dd MMM yyyy')}</p>
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs"
                            onClick={() => router.push(`/orders`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => router.push(`/invoice/${order.id}`)}
                          >
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
                {dayOrders.length > 3 && (
                  <span className="text-xs text-gray-400 px-1">+{dayOrders.length - 3} lagi</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
