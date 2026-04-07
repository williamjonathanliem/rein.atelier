'use client'

import { useState } from 'react'
import {
  DndContext, DragEndEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors,
  closestCorners, DragOverlay,
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { AddOrderModal } from '@/components/orders/AddOrderModal'
import { useOrdersContext } from '@/contexts/OrdersContext'
import type { Order, OrderStatus } from '@/types'

const COLUMNS: OrderStatus[] = ['pending', 'in_progress', 'revision', 'completed', 'cancelled']

interface KanbanBoardProps {
  onWhatsapp?: (order: Order) => void
}

export function KanbanBoard({ onWhatsapp }: KanbanBoardProps) {
  const { orders, updateStatus } = useOrdersContext()
  const [addOpen, setAddOpen] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const ordersByStatus = (status: OrderStatus) => orders.filter(o => o.status === status)
  const activeOrder = activeId ? orders.find(o => o.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const orderId = String(active.id)
    const targetColumn = COLUMNS.find(c => c === over.id)
      ?? orders.find(o => o.id === over.id)?.status
    if (targetColumn) {
      const order = orders.find(o => o.id === orderId)
      if (order && order.status !== targetColumn) {
        await updateStatus(orderId, targetColumn)
      }
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[500px]">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              orders={ordersByStatus(status)}
              onEdit={order => { setEditOrder(order); setAddOpen(true) }}
              onWhatsapp={onWhatsapp}
              onAdd={status === 'pending' ? () => { setEditOrder(null); setAddOpen(true) } : undefined}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOrder && (
            <div className="opacity-90 rotate-1 shadow-2xl">
              <KanbanCard order={activeOrder} onEdit={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddOrderModal
        open={addOpen}
        onOpenChange={open => { setAddOpen(open); if (!open) setEditOrder(null) }}
        editOrder={editOrder}
      />
    </>
  )
}
