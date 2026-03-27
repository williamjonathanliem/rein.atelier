'use client'

import { TopBar } from '@/components/layout/TopBar'
import { StatCard } from '@/components/dashboard/StatCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { StatusBreakdownChart } from '@/components/dashboard/StatusBreakdownChart'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useAlerts } from '@/hooks/useAlerts'
import { formatIDR } from '@/lib/utils'
import { DollarSign, Clock, TrendingUp, ShoppingBag } from 'lucide-react'

export default function DashboardPage() {
  const { orders, loading } = useOrdersContext()
  const stats = useDashboardStats(orders)
  const alerts = useAlerts(orders)

  if (loading) {
    return (
      <div>
        <TopBar title="Overview" />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Overview" />
      <div className="p-8">
        {/* Alert banners */}
        <AlertBanner alerts={alerts} />

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Pendapatan Bulan Ini"
            value={formatIDR(stats.revenueThisMonth)}
            delta={stats.revenueDelta}
            subText="vs bulan lalu"
            accent="violet"
            icon={DollarSign}
          />
          <StatCard
            title="Belum Dibayar"
            value={formatIDR(stats.outstandingTotal)}
            subText="outstanding"
            accent="amber"
            icon={Clock}
          />
          <StatCard
            title="Rata-rata Nilai Order"
            value={formatIDR(stats.averageOrderValue)}
            subText="per order"
            accent="emerald"
            icon={TrendingUp}
          />
          <StatCard
            title="Total Pesanan"
            value={String(stats.totalOrders)}
            subText={`+${stats.ordersThisMonth} bulan ini`}
            accent="blue"
            icon={ShoppingBag}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <RevenueChart data={stats.revenueByMonth} />
          <StatusBreakdownChart data={stats.ordersByStatus} totalOrders={stats.totalOrders} />
        </div>

        {/* Upcoming deadlines */}
        <UpcomingDeadlines orders={stats.upcomingDeadlines} />
      </div>
    </div>
  )
}
