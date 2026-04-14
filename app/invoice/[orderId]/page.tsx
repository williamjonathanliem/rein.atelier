'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { InvoiceStudio } from '@/components/invoice/InvoiceStudio'
import { AREA_LABELS } from '@/lib/shippingRates'
import type { Order, Settings, InvoiceTemplate } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) return {}
  return Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value ?? '']))
}

async function generateInvoiceNumber(prefix: string): Promise<string> {
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
  const next = (count ?? 0) + 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoicePage() {
  const params = useParams<{ orderId: string }>()
  const router = useRouter()
  const orderId = params.orderId

  const [order, setOrder] = useState<Order | null>(null)
  const [settings, setSettings] = useState<Settings>({})
  const [invNum, setInvNum] = useState<string>('INV-001')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [{ data: orderData, error: orderErr }, settingsData] = await Promise.all([
          supabase.from('orders').select('*').eq('id', orderId).single(),
          fetchSettings(),
        ])

        if (orderErr || !orderData) {
          setError('Order not found.')
          return
        }

        setOrder(orderData as Order)
        setSettings(settingsData)

        const prefix = settingsData['invoice_number_prefix'] ?? 'INV-'
        const num = await generateInvoiceNumber(prefix)
        setInvNum(num)
      } catch (e) {
        setError('Failed to load data.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (orderId) load()
  }, [orderId])

  const handleDesignChange = useCallback(async (design: {
    invoice_template: InvoiceTemplate
    invoice_color: string
    invoice_font: string
    invoice_date_format: string
  }) => {
    if (!orderId) return
    await supabase.from('orders').update(design).eq('id', orderId)
  }, [orderId])

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{
        height: '100vh', background: '#0f0f11',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        fontFamily: "'Instrument Sans', sans-serif", color: '#9998a8',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid rgba(124,108,252,0.3)',
          borderTopColor: '#7c6cfc', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{ fontSize: 14 }}>Loading invoice…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Error state ──
  if (error || !order) {
    return (
      <div style={{
        height: '100vh', background: '#0f0f11',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        fontFamily: "'Instrument Sans', sans-serif", color: '#f0eff4',
      }}>
        <p style={{ color: '#f87171', fontSize: 16 }}>{error ?? 'Order not found.'}</p>
        <Link
          href="/orders"
          style={{
            background: '#7c6cfc', color: '#fff', padding: '8px 20px',
            borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}
        >
          ← Back to Orders
        </Link>
      </div>
    )
  }

  // Compute discount value
  const discountValue = order.discount_type === 'percent'
    ? order.price * (order.discount_amount ?? 0) / 100
    : (order.discount_amount ?? 0)

  // Build invoice line items — bouquet + optional shipping (discount handled in totals section)
  const invoiceItems = [
    {
      desc: order.description ?? '',
      sub: order.product_type ?? '',
      qty: 1,
      price: order.price,
    },
    ...(order.delivery_type === 'delivery' && (order.shipping_cost ?? 0) > 0
      ? [{
          desc: 'Ongkos Kirim',
          sub: `${AREA_LABELS[order.shipping_origin ?? ''] ?? ''} → ${AREA_LABELS[order.shipping_destination ?? ''] ?? ''}`,
          qty: 1,
          price: order.shipping_cost,
        }]
      : []
    ),
  ]

  return (
    <>
      {/* Google Fonts for invoice templates */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <InvoiceStudio
        onBack={() => router.back()}

        // Business info from settings
        businessName={settings['business_name']}
        businessEmail={settings['business_email']}
        businessPhone={settings['business_phone']}
        businessAddress={settings['business_address']}
        businessLogoUrl={settings['business_logo_url'] || undefined}
        taxName={settings['tax_name']}
        taxNumber={settings['tax_number']}

        // Client from order snapshot
        clientName={order.client_name}
        clientPhone={order.client_phone}
        clientEmail={order.client_email}
        clientAddress={order.client_address}
        clientRef={order.order_number}

        // Invoice metadata
        invoiceNumber={invNum}
        currency="IDR"
        issueDate={todayStr()}
        dueDate={order.deadline}

        // Line items: bouquet + shipping (discount shown in totals section)
        initialItems={invoiceItems}
        initialDiscountAmt={discountValue}

        // Payment defaults from settings
        paymentBank={settings['default_payment_bank']}
        paymentAccountName={settings['default_payment_account_name']}
        paymentAccountNumber={settings['default_payment_account_number']}

        // Notes & terms defaults
        defaultNotes={settings['default_invoice_notes']}
        defaultTerms={settings['default_invoice_terms']}

        // Design preferences stored per order
        initialTemplate={order.invoice_template}
        initialColor={order.invoice_color}
        initialFont={order.invoice_font}
        initialDateFormat={order.invoice_date_format}

        // Paid status from payment_status
        initialPaid={order.payment_status === 'paid'}

        // Persist design changes back to order row
        onDesignChange={handleDesignChange}

        // WhatsApp tab
        orderForWhatsapp={order}
        settingsForWhatsapp={settings}
      />
    </>
  )
}
