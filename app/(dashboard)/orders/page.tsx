'use client'

import { TopBar } from '@/components/layout/TopBar'
import { OrdersTable } from '@/components/orders/OrdersTable'

export default function OrdersPage() {
  return (
    <div>
      <TopBar title="Pesanan" />
      <div className="p-8">
        <OrdersTable />
      </div>
    </div>
  )
}
