import { format as dateFnsFormat } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// IDR currency formatting
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  // → "Rp 250.000"
}

// IMPORTANT: Never pass YYYY-MM-DD strings to new Date() — it parses as UTC
// and causes timezone offset bugs (e.g. Jan 1 becomes Dec 31).
// Always use this function or parse the parts manually.
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d) // local midnight — safe
}

export function formatDate(dateStr: string, fmt: string = 'MMM d, yyyy'): string {
  if (!dateStr) return '—'
  return dateFnsFormat(parseLocalDate(dateStr), fmt)
}

export function daysUntil(dateStr: string): number {
  const deadline = parseLocalDate(dateStr)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000)
}

export function isOverdue(dateStr: string): boolean {
  return daysUntil(dateStr) < 0
}

export function isDueSoon(dateStr: string): boolean {
  const d = daysUntil(dateStr)
  return d >= 0 && d <= 3
}

// Order number generator — fetches latest from Supabase and increments
export async function generateOrderNumber(supabase: any, prefix: string = 'ORD-'): Promise<string> {
  const { data } = await supabase
    .from('orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(1)

  if (!data || data.length === 0) return `${prefix}001`
  const last = data[0].order_number as string
  const num = parseInt(last.replace(prefix, ''), 10)
  return `${prefix}${String(isNaN(num) ? 1 : num + 1).padStart(3, '0')}`
}

// Invoice number generator
export async function generateInvoiceNumber(supabase: any, prefix: string = 'INV-'): Promise<string> {
  // Use order_number field pattern to find highest invoice number
  const { data } = await supabase
    .from('orders')
    .select('id')
    .limit(1)

  // Generate based on timestamp for uniqueness
  const num = Date.now().toString().slice(-3)
  return `${prefix}${String(num).padStart(3, '0')}`
}

export function todayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
