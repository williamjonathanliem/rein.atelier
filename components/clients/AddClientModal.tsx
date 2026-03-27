'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useClientsContext } from '@/contexts/ClientsContext'
import type { Client } from '@/types'

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editClient?: Client | null
}

const emptyForm = { name: '', phone: '', email: '', notes: '' }

export function AddClientModal({ open, onOpenChange, editClient }: AddClientModalProps) {
  const { addClient, updateClient } = useClientsContext()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Sync form when editClient changes
  useState(() => {
    if (editClient) {
      setForm({
        name: editClient.name ?? '',
        phone: editClient.phone ?? '',
        email: editClient.email ?? '',
        notes: editClient.notes ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  })

  const set = (k: keyof typeof emptyForm, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    if (editClient) {
      await updateClient(editClient.id, form)
    } else {
      await addClient(form)
    }
    setSaving(false)
    onOpenChange(false)
    setForm(emptyForm)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editClient ? 'Edit Klien' : 'Tambah Klien'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">Nama Klien *</Label>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Nama lengkap klien"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Nomor HP / WhatsApp</Label>
              <Input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="08123456789"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@contoh.com"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Catatan</Label>
            <Textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Preferensi, info penting tentang klien..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : editClient ? 'Simpan Perubahan' : 'Tambah Klien'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
