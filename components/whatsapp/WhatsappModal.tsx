'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WhatsappGenerator } from './WhatsappGenerator'
import type { Order, Settings } from '@/types'

interface WhatsappModalProps {
  order: Order | null
  settings: Settings
  onClose: () => void
}

export function WhatsappModal({ order, settings, onClose }: WhatsappModalProps) {
  return (
    <Dialog open={!!order} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>💬</span>
            Pesan WhatsApp — {order?.order_number}
          </DialogTitle>
        </DialogHeader>
        {order && <WhatsappGenerator order={order} settings={settings} />}
      </DialogContent>
    </Dialog>
  )
}
