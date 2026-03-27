'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import type { Order, DashboardStats, OrderStatus } from '@/types'
import { parseLocalDate } from '@/lib/utils'

export function useDashboardStats(orders: Order[]): DashboardStats {
  return useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

    // Revenue this month (completed + paid orders)
    const revenueThisMonth = orders
      .filter(o => {
        if (!['completed', 'paid'].includes(o.status) && o.payment_status === 'unpaid') {
          // Include all non-cancelled orders for revenue
        }
        const d = parseLocalDate(o.order_date)
        return (
          d.getMonth() === thisMonth &&
          d.getFullYear() === thisYear &&
          o.status !== 'cancelled'
        )
      })
      .reduce((sum, o) => sum + (o.price ?? 0), 0)

    const revenueLastMonth = orders
      .filter(o => {
        const d = parseLocalDate(o.order_date)
        return (
          d.getMonth() === lastMonth &&
          d.getFullYear() === lastMonthYear &&
          o.status !== 'cancelled'
        )
      })
      .reduce((sum, o) => sum + (o.price ?? 0), 0)

    const revenueDelta =
      revenueLastMonth === 0
        ? 100
        : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100

    // Outstanding total (price - deposit for unpaid/partial)
    const outstandingTotal = orders
      .filter(o => ['unpaid', 'partial'].includes(o.payment_status) && o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.price - (o.deposit_amount ?? 0)), 0)

    // Average order value
    const validOrders = orders.filter(o => o.status !== 'cancelled')
    const averageOrderValue =
      validOrders.length === 0
        ? 0
        : validOrders.reduce((sum, o) => sum + (o.price ?? 0), 0) / validOrders.length

    // Total orders
    const totalOrders = orders.filter(o => o.status !== 'cancelled').length

    // Orders this month
    const ordersThisMonth = orders.filter(o => {
      const d = parseLocalDate(o.order_date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear && o.status !== 'cancelled'
    }).length

    // Orders by status
    const statusCounts: Record<string, number> = {}
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
    }
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as OrderStatus,
      count,
    }))

    // Revenue by month — last 6 calendar months
    const revenueByMonth: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const revenue = orders
        .filter(o => {
          const od = parseLocalDate(o.order_date)
          return od.getMonth() === m && od.getFullYear() === y && o.status !== 'cancelled'
        })
        .reduce((sum, o) => sum + (o.price ?? 0), 0)
      revenueByMonth.push({ month: format(d, 'MMM'), revenue })
    }

    // Upcoming deadlines — next 5 non-completed/cancelled orders by deadline ascending
    const upcomingDeadlines = orders
      .filter(o => !['completed', 'cancelled'].includes(o.status))
      .sort((a, b) => {
        const da = parseLocalDate(a.deadline).getTime()
        const db = parseLocalDate(b.deadline).getTime()
        return da - db
      })
      .slice(0, 5)

    return {
      revenueThisMonth,
      revenueLastMonth,
      revenueDelta,
      outstandingTotal,
      averageOrderValue,
      totalOrders,
      ordersThisMonth,
      ordersByStatus,
      revenueByMonth,
      upcomingDeadlines,
    }
  }, [orders])
}
