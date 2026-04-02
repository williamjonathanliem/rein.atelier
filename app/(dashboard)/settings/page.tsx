'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Upload, X } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useSettingsContext } from '@/contexts/SettingsContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettingsContext()
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading) {
      setForm({ ...settings })
    }
  }, [settings, loading])

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    await updateSettings(form)
    setSaving(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.')
      return
    }
    setLogoUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `logo-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('business-assets').getPublicUrl(path)
      set('business_logo_url', data.publicUrl)
      toast.success('Logo uploaded successfully!')
    } catch (err: any) {
      toast.error('Failed to upload logo: ' + err.message)
    } finally {
      setLogoUploading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Settings" />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Settings" />
      <div className="p-8 max-w-2xl">
        <div className="flex flex-col gap-6">

          {/* Profil Bisnis */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Business Profile</h3>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block">Business Logo</Label>
                <div className="flex items-center gap-3">
                  {form.business_logo_url ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.business_logo_url} alt="Logo" className="h-12 max-w-[160px] object-contain rounded-lg border border-gray-100" />
                      <button
                        onClick={() => set('business_logo_url', '')}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-12 w-28 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                      No logo yet
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}>
                    <Upload className="h-3.5 w-3.5" />
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Business Name</Label>
                  <Input value={form.business_name ?? ''} onChange={e => set('business_name', e.target.value)} placeholder="rein.atelier" />
                </div>
                <div>
                  <Label className="mb-1.5 block">Business Email</Label>
                  <Input type="email" value={form.business_email ?? ''} onChange={e => set('business_email', e.target.value)} placeholder="hello@rein.atelier" />
                </div>
                <div>
                  <Label className="mb-1.5 block">WhatsApp / Phone Number</Label>
                  <Input value={form.business_phone ?? ''} onChange={e => set('business_phone', e.target.value)} placeholder="+62 812 3456 7890" />
                </div>
                <div>
                  <Label className="mb-1.5 block">Tax Name</Label>
                  <Input value={form.tax_name ?? ''} onChange={e => set('tax_name', e.target.value)} placeholder="NPWP" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Business Address</Label>
                <Textarea value={form.business_address ?? ''} onChange={e => set('business_address', e.target.value)} placeholder="123 Main St, City, State" rows={2} />
              </div>
              <div>
                <Label className="mb-1.5 block">Tax Number</Label>
                <Input value={form.tax_number ?? ''} onChange={e => set('tax_number', e.target.value)} placeholder="00.000.000.0-000.000" />
              </div>
            </div>
          </div>

          {/* Nomor & Mata Uang */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Numbering & Currency</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="mb-1.5 block">Order Prefix</Label>
                <Input value={form.order_number_prefix ?? 'ORD-'} onChange={e => set('order_number_prefix', e.target.value)} placeholder="ORD-" />
              </div>
              <div>
                <Label className="mb-1.5 block">Invoice Prefix</Label>
                <Input value={form.invoice_number_prefix ?? 'INV-'} onChange={e => set('invoice_number_prefix', e.target.value)} placeholder="INV-" />
              </div>
              <div>
                <Label className="mb-1.5 block">Currency</Label>
                <Input value={form.currency ?? 'IDR'} onChange={e => set('currency', e.target.value)} placeholder="IDR" />
              </div>
            </div>
          </div>

          {/* Detail Pembayaran */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Bank Name</Label>
                <Input value={form.default_payment_bank ?? ''} onChange={e => set('default_payment_bank', e.target.value)} placeholder="Maybank, Chase, HSBC, etc." />
              </div>
              <div>
                <Label className="mb-1.5 block">Account Name</Label>
                <Input value={form.default_payment_account_name ?? ''} onChange={e => set('default_payment_account_name', e.target.value)} placeholder="Account holder name" />
              </div>
              <div>
                <Label className="mb-1.5 block">Account Number</Label>
                <Input value={form.default_payment_account_number ?? ''} onChange={e => set('default_payment_account_number', e.target.value)} placeholder="1234-5678-9012" />
              </div>
              <div>
                <Label className="mb-1.5 block">Business WhatsApp Number</Label>
                <Input value={form.whatsapp_number ?? ''} onChange={e => set('whatsapp_number', e.target.value)} placeholder="628123456789" />
              </div>
            </div>
          </div>

          {/* Template Pesan Default */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Default Message Templates</h3>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block">Default Invoice Notes</Label>
                <Textarea
                  value={form.default_invoice_notes ?? ''}
                  onChange={e => set('default_invoice_notes', e.target.value)}
                  placeholder="Thank you for your order at rein.atelier! 🌸"
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Default Terms & Conditions</Label>
                <Textarea
                  value={form.default_invoice_terms ?? ''}
                  onChange={e => set('default_invoice_terms', e.target.value)}
                  placeholder="Payment is due within 14 days of receiving this invoice."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save */}
        <div className="sticky bottom-0 bg-gray-50 py-4 mt-6 border-t border-gray-200">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
