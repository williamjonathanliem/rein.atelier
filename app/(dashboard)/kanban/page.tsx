'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { WhatsappModal } from '@/components/whatsapp/WhatsappModal'
import { useSettingsContext } from '@/contexts/SettingsContext'
import type { Order } from '@/types'

export default function KanbanPage() {
  const { settings } = useSettingsContext()
  const [waOrder, setWaOrder] = useState<Order | null>(null)

  return (
    <div>
      <TopBar title="Kanban" />
      <div className="p-8">
        <KanbanBoard onWhatsapp={order => setWaOrder(order)} />
      </div>
      <WhatsappModal
        order={waOrder}
        settings={settings}
        onClose={() => setWaOrder(null)}
      />
    </div>
  )
}
