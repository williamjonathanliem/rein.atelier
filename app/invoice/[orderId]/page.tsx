'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, MessageCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceStudio } from '@/components/invoice/InvoiceStudio'
import { WhatsappGenerator } from '@/components/whatsapp/WhatsappGenerator'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { useSettingsContext } from '@/contexts/SettingsContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'

// ── Helpers ────────────────────────────────────────────────────────────────

async function getNextInvoiceNum(prefix: string): Promise<string> {
  // Use a timestamp-based suffix to guarantee uniqueness
  const { data } = await supabase
    .from('orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!data || data.length === 0) return `${prefix}001`

  // Try to find the highest invoice-prefixed number already used
  const nums = data
    .map(r => {
      const n = parseInt(String(r.order_number).replace(prefix, ''), 10)
      return isNaN(n) ? 0 : n
    })
    .filter(n => n > 0)

  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

// ── Page ───────────────────────────────────────────────────────────────────

type Tab = 'invoice' | 'whatsapp'

export default function InvoicePage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') ?? 'invoice') as Tab

  const { orders, updateOrder, loading: ordersLoading } = useOrdersContext()
  const { settings, loading: settingsLoading } = useSettingsContext()

  const [tab, setTab] = useState<Tab>(initialTab)
  const [invNum, setInvNum] = useState<string>('')
  const [invNumLoading, setInvNumLoading] = useState(true)

  const order = orders.find(o => o.id === orderId) as Order | undefined

  // Generate invoice number once settings are ready
  useEffect(() => {
    if (settingsLoading) return
    const prefix = settings.invoice_number_prefix || 'INV-'
    getNextInvoiceNum(prefix).then(num => {
      setInvNum(num)
      setInvNumLoading(false)
    })
  }, [settings, settingsLoading])

  const handleDesignChange = useCallback(
    (design: Partial<Pick<Order, 'invoice_template' | 'invoice_color' | 'invoice_font' | 'invoice_date_format'>>) => {
      if (order) updateOrder(order.id, design)
    },
    [order, updateOrder]
  )

  const loading = ordersLoading || settingsLoading || invNumLoading

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Pesanan tidak ditemukan.</p>
        <Button onClick={() => router.push('/orders')}>Kembali ke Pesanan</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center gap-4 px-6 h-14">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/orders')}
          className="gap-1.5 text-gray-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        <div className="h-4 w-px bg-gray-200" />

        {/* Order info */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">{order.order_number}</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm font-medium text-gray-700">{order.client_name}</span>
        </div>

        <div className="flex-1" />

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('invoice')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === 'invoice'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Invoice
          </button>
          <button
            onClick={() => setTab('whatsapp')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === 'whatsapp'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
            {order.whatsapp_sent && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {tab === 'invoice' ? (
          // Invoice Studio fills the full remaining height
          <div className="h-[calc(100vh-56px)]">
            <InvoiceStudio
              order={order}
              settings={settings}
              invNum={invNum}
              onDesignChange={handleDesignChange}
            />
          </div>
        ) : (
          // WhatsApp generator — centred card layout
          <div className="max-w-2xl mx-auto py-8 px-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <WhatsappGenerator order={order} settings={settings} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
