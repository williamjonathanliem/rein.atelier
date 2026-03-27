'use client'

// TODO: Implement InvoiceStudio component
// See MESSAGE 2 in the project spec for the full HTML reference to port.
// Key requirements:
//   - InvoiceState mirrors the S object from invoice-studio.html
//   - renderInvoiceDoc(state) writes to document.getElementById('invoice-doc').innerHTML directly
//   - exportPDF() clones #invoice-doc → font probe → document.fonts.ready + 350ms → html2canvas → jsPDF A4 tile
//   - Three templates: classic, modern, minimal (exact HTML from reference)
//   - All invoice doc CSS injected as <style> tag, scoped under #invoice-doc
//   - Total Due row locked to Instrument Sans !important to prevent font collision

import type { Order, Settings } from '@/types'

export interface InvoiceStudioProps {
  order: Order
  settings: Settings
  invNum: string
  onDesignChange: (design: Partial<Pick<Order, 'invoice_template' | 'invoice_color' | 'invoice_font' | 'invoice_date_format'>>) => void
}

export function InvoiceStudio(_props: InvoiceStudioProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400">
      Invoice Studio — coming soon
    </div>
  )
}
