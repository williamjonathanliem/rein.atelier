'use client'

import { createContext, useContext } from 'react'
import { useClients } from '@/hooks/useClients'
import type { Client } from '@/types'

interface ClientsContextType {
  clients: Client[]
  loading: boolean
  addClient: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client | null>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

const ClientsContext = createContext<ClientsContextType>({
  clients: [],
  loading: true,
  addClient: async () => null,
  updateClient: async () => {},
  deleteClient: async () => {},
})

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const value = useClients()
  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
}

export function useClientsContext() {
  return useContext(ClientsContext)
}
