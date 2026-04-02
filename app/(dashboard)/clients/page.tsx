'use client'

import { TopBar } from '@/components/layout/TopBar'
import { ClientsTable } from '@/components/clients/ClientsTable'

export default function ClientsPage() {
  return (
    <div>
      <TopBar title="Client" />
      <div className="p-8">
        <ClientsTable />
      </div>
    </div>
  )
}
