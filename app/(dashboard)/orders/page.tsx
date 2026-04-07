'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { WhatsappModal } from '@/components/whatsapp/WhatsappModal'
import { useSettingsContext } from '@/contexts/SettingsContext'
import type { Order } from '@/types'

export default function OrdersPage() {
  const { settings } = useSettingsContext()
  const [waOrder, setWaOrder] = useState<Order | null>(null)

  return (
    <div>
      <TopBar title="Orders" />
      <div className="p-8">
        <OrdersTable onWhatsapp={order => setWaOrder(order)} />
      </div>
      <WhatsappModal
        order={waOrder}
        settings={settings}
        onClose={() => setWaOrder(null)}
      />
    </div>
  )
}
