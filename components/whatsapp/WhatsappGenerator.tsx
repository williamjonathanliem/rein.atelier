'use client'

import { useState, useEffect } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { formatIDR, formatDate } from '@/lib/utils'
import { useOrdersContext } from '@/contexts/OrdersContext'
import type { Order, Settings } from '@/types'

function sanitizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, '')
  if (p.startsWith('0')) p = '62' + p.slice(1)
  p = p.replace(/^\+/, '')
  return p
}

function generateMessage(order: Order, settings: Settings, lang: 'id' | 'en'): string {
  const bizName = settings.business_name || 'rein.atelier'
  const bank = settings.default_payment_bank || ''
  const acName = settings.default_payment_account_name || ''
  const acNum = settings.default_payment_account_number || ''
  const remaining = order.price - (order.deposit_amount ?? 0)
  const hasPayment = bank || acName || acNum

  if (lang === 'id') {
    return `Halo ${order.client_name}! 👋

Terima kasih sudah memesan di ${bizName} 🌸

Berikut detail pesanan kamu:

📋 *No. Pesanan:* ${order.order_number}
📦 *Pesanan:* ${order.description || '—'}
💰 *Total:* ${formatIDR(order.price)}
📅 *Deadline:* ${formatDate(order.deadline)}

${order.deposit_paid
  ? `✅ *DP sudah diterima:* ${formatIDR(order.deposit_amount)}
💳 *Sisa pembayaran:* ${formatIDR(remaining)}`
  : `💳 *Pembayaran:* ${formatIDR(order.price)} (belum ada DP)`}
${hasPayment ? `
Pembayaran bisa ditransfer ke:
🏦 *Bank:* ${bank}
👤 *Atas nama:* ${acName}
💳 *No. Rekening:* ${acNum}
Berita: ${order.order_number}
` : ''}
Kalau ada pertanyaan, langsung chat ya! Terima kasih 💐

_${bizName}_`
  } else {
    return `Hi ${order.client_name}! 👋

Thank you for ordering from ${bizName} 🌸

Here are your order details:

📋 *Order No:* ${order.order_number}
📦 *Order:* ${order.description || '—'}
💰 *Total:* ${formatIDR(order.price)}
📅 *Deadline:* ${formatDate(order.deadline)}

${order.deposit_paid
  ? `✅ *Deposit received:* ${formatIDR(order.deposit_amount)}
💳 *Remaining payment:* ${formatIDR(remaining)}`
  : `💳 *Payment:* ${formatIDR(order.price)} (no deposit yet)`}
${hasPayment ? `
Payment can be transferred to:
🏦 *Bank:* ${bank}
👤 *Account name:* ${acName}
💳 *Account number:* ${acNum}
Reference: ${order.order_number}
` : ''}
If you have any questions, feel free to chat! Thank you 💐

_${bizName}_`
  }
}

interface WhatsappGeneratorProps {
  order: Order
  settings: Settings
}

export function WhatsappGenerator({ order, settings }: WhatsappGeneratorProps) {
  const { updateOrder } = useOrdersContext()
  const [lang, setLang] = useState<'id' | 'en'>('id')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(order.whatsapp_sent)

  useEffect(() => {
    setMessage(generateMessage(order, settings, lang))
  }, [order, settings, lang])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    toast.success('Message copied! ✓')
  }

  const handleOpenWhatsApp = () => {
    if (!order.client_phone) {
      toast.error('Client phone number is not set.')
      return
    }
    const phone = sanitizePhone(order.client_phone)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleMarkSent = async () => {
    const newVal = !sent
    setSent(newVal)
    await updateOrder(order.id, { whatsapp_sent: newVal })
    toast.success(newVal ? 'Marked as sent! ✓' : 'Mark cancelled.')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">WhatsApp Message Generator</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Message for {order.client_name} · {order.order_number}
          </p>
        </div>
        <Select value={lang} onValueChange={v => setLang(v as 'id' | 'en')}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">🇮🇩 Indonesian</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={18}
        className="font-mono text-xs leading-relaxed resize-y"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCopy} variant="outline" className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Message
        </Button>
        <Button onClick={handleOpenWhatsApp} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Open WhatsApp
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id="wa-sent"
            checked={sent}
            onCheckedChange={handleMarkSent}
          />
          <Label htmlFor="wa-sent" className="cursor-pointer normal-case text-sm font-medium text-gray-700">
            {sent
              ? <span className="text-emerald-600">✓ WhatsApp Sent</span>
              : 'Mark as Sent'}
          </Label>
        </div>
      </div>
    </div>
  )
}
