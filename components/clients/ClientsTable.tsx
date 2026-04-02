'use client'

import { useState } from 'react'
import { Edit, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AddClientModal } from './AddClientModal'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { useClientsContext } from '@/contexts/ClientsContext'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { formatIDR } from '@/lib/utils'
import { toast } from 'sonner'
import type { Client } from '@/types'

export function ClientsTable() {
  const { clients, loading, deleteClient } = useClientsContext()
  const { orders } = useOrdersContext()
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  )

  const getClientOrders = (clientId: string) =>
    orders.filter(o => o.client_id === clientId)

  const handleDelete = async (id: string) => {
    const clientOrders = getClientOrders(id)
    if (clientOrders.length > 0) {
      toast.error(`This client has ${clientOrders.length} linked orders and cannot be deleted.`)
      return
    }
    await deleteClient(id)
  }

  const clientToDelete = clients.find(c => c.id === deleteId)
  const deleteClientOrders = deleteId ? getClientOrders(deleteId) : []

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex-1" />
        <Button onClick={() => { setEditClient(null); setAddOpen(true) }}>+ Add Client</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"># Orders</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Spent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  {search ? 'No matching clients found.' : 'No clients yet. Add your first client! 🌸'}
                </td>
              </tr>
            ) : (
              filtered.map(client => {
                const clientOrders = getClientOrders(client.id)
                const totalSpent = clientOrders.reduce((sum, o) => sum + (o.price ?? 0), 0)
                const expanded = expandedId === client.id

                return (
                  <>
                    <tr
                      key={client.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(expanded ? null : client.id)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-1.5">
                          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                          {client.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{client.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{client.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{client.notes || '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-700 font-medium">{clientOrders.length}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatIDR(totalSpent)}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditClient(client); setAddOpen(true) }}
                            className="h-7 w-7"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(client.id)}
                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`${client.id}-expanded`} className="bg-violet-50/30">
                        <td colSpan={7} className="px-6 py-3">
                          {clientOrders.length === 0 ? (
                            <p className="text-sm text-gray-400 py-2">No orders for this client yet.</p>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {clientOrders.map(order => (
                                <div key={order.id} className="flex items-center gap-3 text-sm">
                                  <span className="font-mono text-xs text-gray-400">{order.order_number}</span>
                                  <span className="text-gray-700 truncate max-w-xs">{order.description || '—'}</span>
                                  <StatusBadge status={order.status} />
                                  <span className="ml-auto font-medium text-gray-900">{formatIDR(order.price)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <AddClientModal
        open={addOpen}
        onOpenChange={open => { setAddOpen(open); if (!open) setEditClient(null) }}
        editClient={editClient}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => { if (!open) setDeleteId(null) }}
        title="Delete Client"
        description={
          deleteClientOrders.length > 0
            ? `This client has ${deleteClientOrders.length} linked orders and cannot be deleted.`
            : `Are you sure you want to delete ${clientToDelete?.name}?`
        }
        confirmLabel={deleteClientOrders.length > 0 ? 'OK' : 'Delete'}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        destructive={deleteClientOrders.length === 0}
      />
    </div>
  )
}
