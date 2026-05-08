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
  discount_type: 'fixed' as 'fixed' | 'percent',
  discount_amount: '',
}

export function AddOrderModal({ open, onOpenChange, editOrder }: AddOrderModalProps) {
  const { addOrder, updateOrder } = useOrdersContext()
  const { clients } = useClientsContext()
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [clientSearchOpen, setClientSearchOpen] = useState(false)

  // Reference images (up to 5)
  type ImageSlot = { url: string; file?: File }
  const [images, setImages] = useState<ImageSlot[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Derived shipping cost
  const shippingCost = calculateShipping(
    form.delivery_type,
    form.shipping_origin || undefined,
    form.shipping_destination || undefined,
  )
  const bouquetPrice = parseFloat(form.price) || 0
  const discountValue = form.discount_type === 'percent'
    ? bouquetPrice * (parseFloat(form.discount_amount) || 0) / 100
    : (parseFloat(form.discount_amount) || 0)
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
        discount_type: (editOrder.discount_type as 'fixed' | 'percent') ?? 'fixed',
        discount_amount: (() => {
          const raw = editOrder.discount_amount ?? 0
          // Guard against old bug: percent was saved as computed amount (>100 is impossible as a %)
          if ((editOrder.discount_type as string) === 'percent' && raw > 100 && editOrder.price > 0) {
            return String(Math.round(raw / editOrder.price * 100))
          }
          return raw ? String(raw) : ''
        })(),
      })
      const urls = editOrder.reference_image_urls?.length
        ? editOrder.reference_image_urls
        : editOrder.reference_image_url
          ? [editOrder.reference_image_url]
          : []
      setImages(urls.map(url => ({ url })))
    } else {
      setForm({ ...defaultForm, order_date: todayString() })
      setImages([])
    }
  }, [editOrder, open])

  useEffect(() => {
    return () => {
      images.forEach(slot => { if (slot.file) URL.revokeObjectURL(slot.url) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const available = 5 - images.length
    files.slice(0, available).forEach(file => {
      setImages(prev => [...prev, { url: URL.createObjectURL(file), file }])
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const slot = prev[index]
      if (slot.file) URL.revokeObjectURL(slot.url)
      return prev.filter((_, i) => i !== index)
    })
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

    const uploadedUrls = await Promise.all(
      images.map(slot => slot.file ? uploadImage(slot.file) : Promise.resolve(slot.url))
    )
    const finalUrls = uploadedUrls.filter((u): u is string => !!u)

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
      reference_image_url: finalUrls[0] || undefined,
      reference_image_urls: finalUrls,
      handwritten_note: form.handwritten_note || undefined,
      delivery_type: form.delivery_type,
      shipping_origin: isDelivery ? (form.shipping_origin || undefined) : undefined,
      shipping_destination: isDelivery ? (form.shipping_destination || undefined) : undefined,
      shipping_cost: shippingCost,
      discount_type: form.discount_type,
      discount_amount: parseFloat(form.discount_amount) || 0,
    }

    if (editOrder) {
      await updateOrder(editOrder.id, payload)
    } else {
      await addOrder(payload)
    }
    setSaving(false)
    onOpenChange(false)
  }

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

                {/* Reference Pictures */}
                <div>
                  <Label className="mb-1.5 block">Reference Pictures <span className="text-gray-400 font-normal">(up to 5)</span></Label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {images.map((slot, i) => (
                        <div key={i} className="relative group">
                          <div
                            className="relative cursor-pointer rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square"
                            onClick={() => setLightboxIndex(i)}
                          >
                            <img src={slot.url} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="h-3.5 w-3.5 text-white" />
                            </div>
                          </div>
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-red-50 flex items-center justify-center transition-colors">
                            <X className="h-2.5 w-2.5 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {images.length < 5 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center gap-1.5 text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-xs">{images.length === 0 ? 'Click to upload reference images' : `Add more (${5 - images.length} left)`}</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagesSelect} />
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

                {/* Discount */}
                <div>
                  <Label className="mb-1.5 block">Discount <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <div className="flex gap-2">
                    <Select value={form.discount_type} onValueChange={v => set('discount_type', v as 'fixed' | 'percent')}>
                      <SelectTrigger className="w-28 flex-shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Rp (Fixed)</SelectItem>
                        <SelectItem value="percent">% Persen</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={form.discount_amount}
                      onChange={e => set('discount_amount', e.target.value)}
                      placeholder={form.discount_type === 'percent' ? '0' : '0'}
                      min="0"
                      max={form.discount_type === 'percent' ? '100' : undefined}
                    />
                  </div>
                  {discountValue > 0 && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      Diskon: − {formatIDR(discountValue)}
                    </p>
                  )}
                </div>

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
                  {discountValue > 0 && (
                    <div className="flex justify-between text-rose-500 mb-1">
                      <span>Diskon</span>
                      <span>− {formatIDR(discountValue)}</span>
                    </div>
                  )}
                  {form.delivery_type === 'delivery' && (
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Shipping Cost</span>
                      <span>{formatIDR(shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-1">
                    <span>Total</span>
                    <span>{formatIDR(bouquetPrice - discountValue + shippingCost)}</span>
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
      {lightboxIndex !== null && images[lightboxIndex] && (
        <Dialog open={lightboxIndex !== null} onOpenChange={open => { if (!open) setLightboxIndex(null) }}>
          <DialogContent className="max-w-4xl p-2 bg-black/95 border-0">
            <img src={images[lightboxIndex].url} alt="Reference" className="w-full h-auto max-h-[85vh] object-contain rounded" />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
