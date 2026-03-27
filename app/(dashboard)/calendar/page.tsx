'use client'

import { TopBar } from '@/components/layout/TopBar'
import { CalendarView } from '@/components/calendar/CalendarView'

export default function CalendarPage() {
  return (
    <div>
      <TopBar title="Kalender" />
      <div className="p-8">
        <CalendarView />
      </div>
    </div>
  )
}
