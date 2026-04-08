'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown, Upload, X, ZoomIn } from 'lucide-react'
import { cn, todayString, formatIDR } from '@/lib/utils'
import { calculateShipping, getDestinationOptions, AREA_LABELS } from '@/lib/shippingRates'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { useClientsContext } from '@/contexts/ClientsContext'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'

const PRODUCT_TYPES = [
  'Bouquet XS', 'Bouquet S', 'Bouquet M', 'Bouquet L',
  'Bloombox S', 'Bloombox M', 'Bloombox L',
  'Frame', 'Pen Holder', 'Others',
]

interface AddOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editOrder?: Order | null
}

const defaultForm = {
  client_id: '',
  client_name: '',
  client_phone: '',
  client_email: '',
  client_address: '',
  product_type: '',
  description: '',
  notes: '',
  price: '',
  deposit_paid: false,
  deposit_amount: '',
  order_date: todayString(),
  deadline: '',
  due_date: '',
  delivery_time: '',
  status: 'pending' as Order['status'],
  priority: 'medium' as Order['priority'],
  payment_status: 'unpaid' as Order['payment_status'],
  invoice_template: 'classic' as Order['invoice_template'],
  invoice_color: '#a78bfa',
  invoice_font: 'Instrument Sans',
  invoice_date_format: 'MMM D, YYYY',
  whatsapp_sent: false,
  reference_image_url: '',
  handwritten_note: '',
  delivery_type: 'pickup' as 'pickup' | 'delivery',
  shipping_origin: '' as '' | 'barat' | 'tengah',
  shipping_destination: '' as '' | 'barat' | 'pusat' | 'selatan' | 'tengah' | 'timur',
}

export function AddOrderModal({ open, onOpenChange, editOrder }: AddOrderModalProps) {
  const { addOrder, updateOrder } = useOrdersContext()
  const { clients } = useClientsContext()
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [clientSearchOpen, setClientSearchOpen] = useState(false)

  // Reference image
  const [refImageFile, setRefImageFile] = useState<File | null>(null)
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null)
  const [showLightbox, setShowLightbox] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Derived shipping cost
  const shippingCost = calculateShipping(
    form.delivery_type,
    form.shipping_origin || undefined,
    form.shipping_destination || undefined,
  )
  const bouquetPrice = parseFloat(form.price) || 0
  const destinationOptions = form.shipping_origin
    ? getDestinationOptions(form.shipping_origin as 'barat' | 'tengah')
    : []

  useEffect(() => {
    if (editOrder) {
      setForm({
        client_id: editOrder.client_id ?? '',
        client_name: editOrder.client_name,
        client_phone: editOrder.client_phone ?? '',
        client_email: editOrder.client_email ?? '',
        client_address: editOrder.client_address ?? '',
        product_type: editOrder.product_type ?? '',
        description: editOrder.description ?? '',
        notes: editOrder.notes ?? '',
        price: String(editOrder.price),
        deposit_paid: editOrder.deposit_paid,
        deposit_amount: String(editOrder.deposit_amount),
        order_date: editOrder.order_date,
        deadline: editOrder.deadline,
        due_date: editOrder.due_date ?? '',
        delivery_time: editOrder.delivery_time ?? '',
        status: editOrder.status,
        priority: editOrder.priority,
        payment_status: editOrder.payment_status,
        invoice_template: editOrder.invoice_template,
        invoice_color: editOrder.invoice_color,
        invoice_font: editOrder.invoice_font,
        invoice_date_format: editOrder.invoice_date_format,
        whatsapp_sent: editOrder.whatsapp_sent,
        reference_image_url: editOrder.reference_image_url ?? '',
        handwritten_note: editOrder.handwritten_note ?? '',
        delivery_type: (editOrder.delivery_type as 'pickup' | 'delivery') ?? 'pickup',
        shipping_origin: (editOrder.shipping_origin as '' | 'barat' | 'tengah') ?? '',
        shipping_destination: (editOrder.shipping_destination as '' | 'barat' | 'pusat' | 'selatan' | 'tengah' | 'timur') ?? '',
      })
      setRefImagePreview(editOrder.reference_image_url ?? null)
    } else {
      setForm({ ...defaultForm, order_date: todayString() })
      setRefImagePreview(null)
    }
    setRefImageFile(null)
  }, [editOrder, open])

  useEffect(() => {
    return () => {
      if (refImagePreview?.startsWith('blob:')) URL.revokeObjectURL(refImagePreview)
    }
  }, [refImagePreview])

  const set = <K extends keyof typeof defaultForm>(k: K, v: (typeof defaultForm)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const selectClient = (clientId: string) => {
    const c = clients.find(c => c.id === clientId)
    if (c) {
      setForm(prev => ({
        ...prev,
        client_id: c.id,
        client_name: c.name,
        client_phone: c.phone ?? '',
        client_email: c.email ?? '',
        client_address: '',
      }))
    }
    setClientSearchOpen(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (refImagePreview?.startsWith('blob:')) URL.revokeObjectURL(refImagePreview)
    setRefImageFile(file)
    setRefImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (refImagePreview?.startsWith('blob:')) URL.revokeObjectURL(refImagePreview)
    setRefImageFile(null)
    setRefImagePreview(null)
    setForm(prev => ({ ...prev, reference_image_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const compressImage = (file: File, maxWidth = 1400, quality = 0.82): Promise<Blob> =>
    new Promise(resolve => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', quality)
      }
      img.src = url
    })

  const uploadImage = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file)
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const { error } = await supabase.storage
      .from('order-references')
      .upload(path, compressed, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false })
    if (error) { console.error('Image upload failed:', error); return null }
    const { data } = supabase.storage.from('order-references').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_name.trim() || !form.deadline) return
    setSaving(true)

    let imageUrl = form.reference_image_url
    if (refImageFile) {
      const uploaded = await uploadImage(refImageFile)
      if (uploaded) imageUrl = uploaded
    }

    const isDelivery = form.delivery_type === 'delivery'
    const payload = {
      client_id: form.client_id || undefined,
      client_name: form.client_name,
      client_phone: form.client_phone,
      client_email: form.client_email,
      client_address: form.client_address,
      product_type: form.product_type || undefined,
      description: form.description,
      notes: form.notes,
      price: bouquetPrice,
      deposit_paid: form.deposit_paid,
      deposit_amount: parseFloat(form.deposit_amount) || 0,
      order_date: form.order_date,
      deadline: form.deadline,
      due_date: form.due_date || undefined,
      delivery_time: form.delivery_time || undefined,
      status: form.status,
      priority: form.priority,
      payment_status: form.payment_status,
      invoice_template: form.invoice_template,
      invoice_color: form.invoice_color,
      invoice_font: form.invoice_font,
      invoice_date_format: form.invoice_date_format,
      whatsapp_sent: form.whatsapp_sent,
      reference_image_url: imageUrl || undefined,
      handwritten_note: form.handwritten_note || undefined,
      delivery_type: form.delivery_type,
      shipping_origin: isDelivery ? (form.shipping_origin || undefined) : undefined,
      shipping_destination: isDelivery ? (form.shipping_destination || undefined) : undefined,
      shipping_cost: shippingCost,
    }

    if (editOrder) {
      await updateOrder(editOrder.id, payload)
    } else {
      await addOrder(payload)
    }
    setSaving(false)
    onOpenChange(false)
  }

  const lightboxSrc = refImagePreview ?? form.reference_image_url

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editOrder ? 'Edit Order' : 'Add Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              {/* Left column — Client & Details */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label className="mb-1.5 block">Select Existing Client</Label>
                  <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between">
                        {form.client_id
                          ? clients.find(c => c.id === form.client_id)?.name ?? form.client_name
                          : 'Search client...'}
                        <ChevronsUpDown className="h-4 w-4 opacity-40" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search client..." />
                        <CommandList>
                          <CommandEmpty>No client found.</CommandEmpty>
                          <CommandGroup>
                            {clients.map(c => (
                              <CommandItem key={c.id} value={c.name} onSelect={() => selectClient(c.id)}>
                                <Check className={cn('mr-2 h-4 w-4', form.client_id === c.id ? 'opacity-100' : 'opacity-0')} />
                                <div>
                                  <p className="font-medium">{c.name}</p>
                                  {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="mb-1.5 block">Client Name *</Label>
                  <Input value={form.client_name} onChange={e => set('client_name', e.target.value)} required placeholder="Client name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block">Phone Number</Label>
                    <Input value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="08123456789" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Email <span className="text-gray-400 font-normal">(optional)</span></Label>
                    <Input type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} placeholder="email@example.com" />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block">Address</Label>
                  <Textarea value={form.client_address} onChange={e => set('client_address', e.target.value)} placeholder="Delivery address (optional)" rows={2} />
                </div>

                <div>
                  <Label className="mb-1.5 block">Product Type</Label>
                  <Select value={form.product_type} onValueChange={v => set('product_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select product type..." /></SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1.5 block">Order Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="E.g. Pink and white, satin ribbon, 10 stems..."
                    rows={3}
                  />
                </div>

                {/* Reference Picture */}
                <div>
                  <Label className="mb-1.5 block">Reference Picture</Label>
                  {refImagePreview || form.reference_image_url ? (
                    <div className="relative">
                      <div
                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                        style={{ aspectRatio: '4/3' }}
                        onClick={() => setShowLightbox(true)}
                      >
                        <img src={refImagePreview ?? form.reference_image_url} alt="Reference" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <ZoomIn className="h-5 w-5 text-white" />
                          <span className="text-white text-xs font-medium">View full size</span>
                        </div>
                      </div>
                      <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-red-50 flex items-center justify-center transition-colors">
                        <X className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-lg p-5 flex flex-col items-center gap-1.5 text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors">
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Click to upload reference image</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </div>

                <div>
                  <Label className="mb-1.5 block">Internal Notes</Label>
                  <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes about this order..." rows={2} />
                </div>

                <div>
                  <Label className="mb-1.5 block">Handwritten Note</Label>
                  <Textarea value={form.handwritten_note} onChange={e => set('handwritten_note', e.target.value)} placeholder="Text to write on the card/note for the customer..." rows={3} />
                </div>
              </div>

              {/* Right column — Order Config */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label className="mb-1.5 block">Price *</Label>
                  <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" min="0" required />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="deposit-paid" checked={form.deposit_paid} onCheckedChange={v => set('deposit_paid', v)} />
                  <Label htmlFor="deposit-paid" className="cursor-pointer normal-case text-sm font-medium text-gray-700">Deposit Paid</Label>
                </div>
                {form.deposit_paid && (
                  <div>
                    <Label className="mb-1.5 block">Deposit Amount</Label>
                    <Input type="number" value={form.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} placeholder="0" min="0" />
                  </div>
                )}

                {/* Pengiriman */}
                <div>
                  <Label className="mb-2 block">Delivery</Label>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-3">
                    <button
                      type="button"
                      className={cn(
                        'flex-1 py-2 text-sm font-medium transition-colors',
                        form.delivery_type === 'pickup'
                          ? 'bg-violet-100 text-violet-700 border-r border-violet-300'
                          : 'bg-white text-gray-500 border-r border-gray-200 hover:bg-gray-50'
                      )}
                      onClick={() => {
                        set('delivery_type', 'pickup')
                        set('shipping_origin', '')
                        set('shipping_destination', '')
                      }}
                    >
                      🛍️ Self Pickup
                    </button>
                    <button
                      type="button"
                      className={cn(
                        'flex-1 py-2 text-sm font-medium transition-colors',
                        form.delivery_type === 'delivery'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      )}
                      onClick={() => set('delivery_type', 'delivery')}
                    >
                      🚗 Delivery (Ongkir)
                    </button>
                  </div>

                  {form.delivery_type === 'pickup' && (
                    <p className="text-xs text-gray-400">📍 Self Pickup in West Surabaya</p>
                  )}

                  {form.delivery_type === 'delivery' && (
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="mb-1 block text-xs">Origin</Label>
                          <Select
                            value={form.shipping_origin}
                            onValueChange={v => {
                              setForm(prev => ({ ...prev, shipping_origin: v as 'barat' | 'tengah', shipping_destination: '' }))
                            }}
                          >
                            <SelectTrigger className="text-xs"><SelectValue placeholder="Select origin..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="barat">West Surabaya</SelectItem>
                              <SelectItem value="tengah">Central Surabaya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="mb-1 block text-xs">Destination</Label>
                          <Select
                            value={form.shipping_destination}
                            onValueChange={v => set('shipping_destination', v as typeof form.shipping_destination)}
                            disabled={!form.shipping_origin}
                          >
                            <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih tujuan..." /></SelectTrigger>
                            <SelectContent>
                              {destinationOptions.map(dest => (
                                <SelectItem key={dest} value={dest}>{AREA_LABELS[dest]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {form.shipping_destination ? (
                        <div className="bg-violet-50 text-violet-700 rounded-lg px-3 py-2 text-sm font-semibold">
                          🚗 Shipping Cost: {formatIDR(shippingCost)}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Select destination to see shipping cost</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Order summary */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 text-sm">
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Bouquet Price</span>
                    <span>{formatIDR(bouquetPrice)}</span>
                  </div>
                  {form.delivery_type === 'delivery' && (
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Shipping Cost</span>
                      <span>{formatIDR(shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-1">
                    <span>Total</span>
                    <span>{formatIDR(bouquetPrice + shippingCost)}</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">Order Date</Label>
                  <Input type="date" value={form.order_date} onChange={e => set('order_date', e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Deadline *</Label>
                  <Input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} required />
                </div>
                <div>
                  <Label className="mb-1.5 block">Delivery Time <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input type="time" value={form.delivery_time} onChange={e => set('delivery_time', e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Due Date <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Status</Label>
                  <Select value={form.status} onValueChange={v => set('status', v as Order['status'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="revision">Revision</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Priority</Label>
                  <Select value={form.priority} onValueChange={v => set('priority', v as Order['priority'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Payment Status</Label>
                  <Select value={form.payment_status} onValueChange={v => set('payment_status', v as Order['payment_status'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editOrder ? 'Save Changes' : 'Add Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {showLightbox && lightboxSrc && (
        <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
          <DialogContent className="max-w-4xl p-2 bg-black/95 border-0">
            <img src={lightboxSrc} alt="Reference" className="w-full h-auto max-h-[85vh] object-contain rounded" />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
