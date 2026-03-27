'use client'

import { TopBar } from '@/components/layout/TopBar'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function KanbanPage() {
  return (
    <div>
      <TopBar title="Kanban" />
      <div className="p-8">
        <KanbanBoard />
      </div>
    </div>
  )
}
