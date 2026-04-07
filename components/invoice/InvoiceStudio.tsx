'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { InvoiceTemplate, Order, Settings } from '@/types'
import { WhatsappGenerator } from '@/components/whatsapp/WhatsappGenerator'

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  desc: string
  sub: string
  qty: number
  price: number
}

interface InvoiceState {
  invoiceNumber: string
  currency: string
  issueDate: string
  dueDate: string
  bizName: string
  bizEmail: string
  bizPhone: string
  bizAddr: string
  bizTaxName: string
  bizTaxNum: string
  logoDataUrl: string | null
  clName: string
  clEmail: string
  clPhone: string
  clAddr: string
  clRef: string
  items: InvoiceItem[]
  discountPct: number
  taxName: string
  taxPct: number
  payBank: string
  payAcName: string
  payAcNum: string
  payRef: string
  notes: string
  terms: string
  template: InvoiceTemplate
  color: string
  font: string
  dateFmt: string
  paid: boolean
}

export interface InvoiceStudioProps {
  businessName?: string
  businessEmail?: string
  businessPhone?: string
  businessAddress?: string
  businessLogoUrl?: string
  taxName?: string
  taxNumber?: string
  clientName?: string
  clientPhone?: string
  clientEmail?: string
  clientAddress?: string
  clientRef?: string
  invoiceNumber?: string
  currency?: string
  issueDate?: string
  dueDate?: string
  initialItems?: InvoiceItem[]
  paymentBank?: string
  paymentAccountName?: string
  paymentAccountNumber?: string
  defaultNotes?: string
  defaultTerms?: string
  initialTemplate?: InvoiceTemplate
  initialColor?: string
  initialFont?: string
  initialDateFormat?: string
  initialPaid?: boolean
  onDesignChange?: (design: {
    invoice_template: InvoiceTemplate
    invoice_color: string
    invoice_font: string
    invoice_date_format: string
  }) => void
  onBack?: () => void
  orderForWhatsapp?: Order
  settingsForWhatsapp?: Settings
}

// ─── DESIGN TOKENS — matches the rein.atelier dashboard light theme ───────────

const T = {
  bg: '#f8f7ff',
  surface: '#ffffff',
  border: '#e9e4ff',
  borderStrong: '#d4cafe',
  text: '#111111',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',
  accent: '#a78bfa',
  accentDark: '#7c3aed',
  accentLight: '#ede9fe',
  accentGlow: 'rgba(167,139,250,0.15)',
  green: '#059669',
  greenBg: '#d1fae5',
  red: '#dc2626',
  redBg: '#fee2e2',
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CURRENCIES: Record<string, string> = {
  MYR: 'RM', SGD: 'S$', USD: '$', EUR: '€',
  GBP: '£', AUD: 'A$', JPY: '¥', IDR: 'Rp',
}

// ─── INVOICE DOCUMENT STYLES — scoped under #invoice-doc ─────────────────────

const INVOICE_STYLES = `
#invoice-doc {
  width: 720px;
  background: #fff;
  color: #111;
  font-family: 'Instrument Sans', sans-serif !important;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(167,139,250,0.12), 0 1px 4px rgba(0,0,0,0.05);
  position: relative;
  --doc-accent: #a78bfa;
  --doc-display-font: 'Instrument Sans', sans-serif;
}
.inv-classic .doc-logo-text, .inv-modern .doc-logo-text,
.inv-minimal .doc-logo-text, .inv-classic .doc-inv-label,
.inv-modern  .doc-inv-label { font-family: var(--doc-display-font); }
.doc-inv-num { font-family: var(--doc-display-font); }
.doc-watermark {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%) rotate(-30deg);
  font-family: 'Syne', sans-serif; font-size: 96px; font-weight: 800;
  letter-spacing: 8px; text-transform: uppercase;
  opacity: 0; pointer-events: none; z-index: 10; transition: opacity 0.3s; user-select: none;
}
.doc-watermark.paid   { color: rgba(5,150,105,0.10); opacity: 1; }
.doc-watermark.unpaid { color: rgba(220,38,38,0.07); opacity: 1; }

/* CLASSIC */
.inv-classic .doc-header { padding: 44px 52px 32px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid var(--doc-accent); }
.inv-classic .doc-logo-img { max-height: 56px; max-width: 140px; object-fit: contain; }
.inv-classic .doc-logo-text { font-size: 26px; font-weight: 800; color: #111; }
.inv-classic .doc-inv-badge { text-align: right; }
.inv-classic .doc-inv-label { font-size: 40px; font-weight: 800; color: rgba(0,0,0,0.06); line-height: 1; text-transform: uppercase; }
.inv-classic .doc-inv-num { font-size: 13px; font-weight: 700; color: #111; margin-top: 4px; }
.inv-classic .doc-inv-date { font-size: 12px; color: #777; margin-top: 2px; }
.inv-classic .doc-body { padding: 28px 52px; }
.inv-classic .doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
.inv-classic .party-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--doc-accent); margin-bottom: 7px; }
.inv-classic .party-name { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 3px; }
.inv-classic .party-detail { font-size: 12px; color: #666; line-height: 1.65; }
.inv-classic .bill-to-box { background: #f8f7ff; border-radius: 10px; padding: 16px 18px; }

/* MODERN */
.inv-modern .doc-header { background: var(--doc-accent); padding: 36px 52px; display: flex; justify-content: space-between; align-items: flex-start; color: #fff; }
.inv-modern .doc-logo-img { max-height: 52px; max-width: 130px; object-fit: contain; filter: brightness(0) invert(1); }
.inv-modern .doc-logo-text { font-size: 24px; font-weight: 800; color: #fff; }
.inv-modern .doc-inv-badge { text-align: right; }
.inv-modern .doc-inv-label { font-size: 32px; font-weight: 800; color: rgba(255,255,255,0.2); text-transform: uppercase; }
.inv-modern .doc-inv-num { font-size: 13px; font-weight: 700; color: #fff; margin-top: 4px; }
.inv-modern .doc-inv-date { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px; }
.inv-modern .doc-body { padding: 28px 52px; }
.inv-modern .doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
.inv-modern .party-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--doc-accent); margin-bottom: 7px; }
.inv-modern .party-name { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 3px; }
.inv-modern .party-detail { font-size: 12px; color: #666; line-height: 1.65; }
.inv-modern .bill-to-box { border-left: 3px solid var(--doc-accent); padding-left: 16px; }

/* MINIMAL */
.inv-minimal .doc-header { padding: 44px 52px 28px; display: flex; justify-content: space-between; align-items: flex-start; }
.inv-minimal .doc-logo-img { max-height: 52px; max-width: 130px; object-fit: contain; }
.inv-minimal .doc-logo-text { font-size: 22px; font-weight: 800; color: #111; }
.inv-minimal .doc-inv-badge { text-align: right; }
.inv-minimal .doc-inv-label { font-family: 'Instrument Sans', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #bbb; }
.inv-minimal .doc-inv-num { font-size: 20px; font-weight: 800; color: #111; margin-top: 2px; }
.inv-minimal .doc-inv-date { font-size: 12px; color: #888; margin-top: 2px; }
.inv-minimal .doc-rule { height: 1px; background: #e5e5e5; margin: 0 52px; }
.inv-minimal .doc-body { padding: 28px 52px; }
.inv-minimal .doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
.inv-minimal .party-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; margin-bottom: 6px; }
.inv-minimal .party-name { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 3px; }
.inv-minimal .party-detail { font-size: 12px; color: #888; line-height: 1.65; }

/* Shared chip */
.inv-status-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; margin-bottom: 4px; }
.chip-paid   { background: rgba(5,150,105,0.10); color: #059669; }
.chip-unpaid { background: rgba(220,38,38,0.10); color: #dc2626; }
.chip-dot        { width: 5px; height: 5px; border-radius: 50%; }
.chip-dot-paid   { background: #059669; }
.chip-dot-unpaid { background: #dc2626; }

/* Table */
.doc-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.doc-table thead tr { background: var(--doc-accent); }
.inv-minimal .doc-table thead tr { background: #111; }
.doc-table th { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #fff; padding: 10px 14px; text-align: left; }
.doc-table th:nth-child(3), .doc-table th:nth-child(4), .doc-table th:nth-child(5) { text-align: right; }
.doc-table td { padding: 10px 14px; font-size: 13px; color: #222; border-bottom: 1px solid #f0f0f0; }
.doc-table td:nth-child(3), .doc-table td:nth-child(4), .doc-table td:nth-child(5) { text-align: right; }
.doc-table td.td-sub { padding-top: 0; font-size: 11.5px; color: #888; padding-bottom: 10px; }
.doc-table tr:nth-child(even) td:not(.td-sub) { background: #fafafa; }

/* Totals */
.doc-totals       { display: flex; justify-content: flex-end; margin-bottom: 4px; }
.doc-totals-inner { min-width: 260px; }
.tot-row          { display: flex; justify-content: space-between; padding: 5px 14px; font-size: 13px; }
.tot-row .tot-l   { color: #777; font-weight: 500; }
.tot-row .tot-r   { font-weight: 600; color: #222; }
.tot-row.disc .tot-r { color: #dc2626; }
.tot-divider      { height: 1px; background: #e5e5e5; margin: 8px 14px; }
.tot-row.grand    { background: var(--doc-accent); border-radius: 8px; margin: 0 8px; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; gap: 16px; }
.tot-row.grand .tot-l { color: rgba(255,255,255,0.85); font-weight: 600; font-size: 13px; white-space: nowrap; flex-shrink: 0; font-family: 'Instrument Sans', sans-serif !important; }
.tot-row.grand .tot-r { color: #fff; font-size: 16px; font-weight: 800; white-space: nowrap; text-align: right; font-family: 'Instrument Sans', sans-serif !important; }
.inv-minimal .tot-row.grand { background: #111; }

/* Payment & Footer */
.doc-payment  { padding: 20px 52px; border-top: 1px solid #f0f0f0; }
.pay-title    { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #bbb; margin-bottom: 10px; }
.pay-grid     { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.pay-item .pay-lbl { font-size: 10px; color: #aaa; font-weight: 500; margin-bottom: 2px; }
.pay-item .pay-val { font-size: 13px; font-weight: 600; color: #333; }
.doc-footer   { padding: 20px 52px 36px; }
.doc-notes-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #bbb; margin-bottom: 5px; }
.doc-notes-text { font-size: 13px; color: #555; line-height: 1.6; margin-bottom: 14px; }
.doc-terms    { font-size: 11.5px; color: #aaa; line-height: 1.6; border-top: 1px solid #f0f0f0; padding-top: 12px; }
`

// ─── PURE HELPERS ─────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtDate(s: string, fmt: string): string {
  if (!s) return '—'
  const p = s.split('-')
  if (p.length !== 3) return s
  const y = parseInt(p[0], 10), m0 = parseInt(p[1], 10) - 1, d = parseInt(p[2], 10)
  if (isNaN(y) || isNaN(m0) || isNaN(d)) return s
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const DD = String(d).padStart(2, '0'), MM = String(m0 + 1).padStart(2, '0')
  switch (fmt) {
    case 'DD/MM/YYYY': return `${DD}/${MM}/${y}`
    case 'MM/DD/YYYY': return `${MM}/${DD}/${y}`
    case 'YYYY-MM-DD': return `${y}-${MM}-${DD}`
    default: return `${M[m0]} ${d}, ${y}`
  }
}

function fmtMoney(n: number, cur: string): string {
  return `${CURRENCIES[cur] ?? cur} ${(+n || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── RENDER INVOICE DOC — pure DOM writer, never React ───────────────────────

function renderInvoiceDoc(s: InvoiceState, el: HTMLElement): void {
  const { invoiceNumber: num, currency, issueDate, dueDate,
    bizName, bizEmail, bizPhone, bizAddr, bizTaxName, bizTaxNum, logoDataUrl,
    clName, clEmail, clPhone, clAddr, clRef,
    items, discountPct: disc, taxName, taxPct,
    payBank, payAcName, payAcNum, payRef, notes, terms,
    template, color, font, dateFmt, paid } = s

  const date = fmtDate(issueDate, dateFmt), due = fmtDate(dueDate, dateFmt)
  const fm = (n: number) => fmtMoney(n, currency)

  const subtotal = items.reduce((a, it) => a + it.qty * it.price, 0)
  const discAmt = subtotal * disc / 100, after = subtotal - discAmt
  const taxAmt = after * taxPct / 100, total = after + taxAmt

  const logoHtml = logoDataUrl ? `<img class="doc-logo-img" src="${logoDataUrl}" alt="logo">` : `<div class="doc-logo-text">${esc(bizName)}</div>`
  const bizContact = [bizEmail, bizPhone].filter(Boolean).join(' &nbsp;|&nbsp; ')
  const bizAddrHtml = bizAddr ? `<br>${esc(bizAddr).replace(/\n/g, '<br>')}` : ''
  const taxLine = (bizTaxName || bizTaxNum) ? `<br><span style="font-size:10.5px">${esc(bizTaxName)} ${esc(bizTaxNum)}</span>` : ''
  const clAddrHtml = clAddr ? esc(clAddr).replace(/\n/g, '<br>') + '<br>' : ''
  const clRefHtml = clRef ? `<br><span style="font-size:10.5px;color:#aaa">Ref: ${esc(clRef)}</span>` : ''

  const chipHtml = `<div class="inv-status-chip ${paid ? 'chip-paid' : 'chip-unpaid'}"><div class="chip-dot ${paid ? 'chip-dot-paid' : 'chip-dot-unpaid'}"></div>${paid ? 'Paid' : 'Unpaid'}</div>`

  const itemRows = items.map((it, i) => {
    const subRow = it.sub ? `<tr><td class="td-sub" colspan="2"></td><td class="td-sub" colspan="3" style="text-align:left;color:#888;font-size:11.5px">${esc(it.sub)}</td></tr>` : ''
    return `<tr><td>${i + 1}</td><td>${esc(it.desc) || '<em style="color:#ccc">—</em>'}</td><td>${it.qty}</td><td>${fm(it.price)}</td><td><strong>${fm(it.qty * it.price)}</strong></td></tr>${subRow}`
  }).join('')

  let totHtml = `<div class="tot-row"><span class="tot-l">Subtotal</span><span class="tot-r">${fm(subtotal)}</span></div>`
  if (disc > 0) totHtml += `<div class="tot-row disc"><span class="tot-l">Discount (${disc}%)</span><span class="tot-r">− ${fm(discAmt)}</span></div>`
  if (taxPct > 0) totHtml += `<div class="tot-row"><span class="tot-l">${esc(taxName)} (${taxPct}%)</span><span class="tot-r">${fm(taxAmt)}</span></div>`
  totHtml += `<div class="tot-divider"></div><div class="tot-row grand"><span class="tot-l">Total Due</span><span class="tot-r">${fm(total)}</span></div>`

  const payHtml = (payBank || payAcName || payAcNum) ? `<div class="doc-payment"><div class="pay-title">Payment Details</div><div class="pay-grid">
    ${payBank ? `<div class="pay-item"><div class="pay-lbl">Bank</div><div class="pay-val">${esc(payBank)}</div></div>` : ''}
    ${payAcName ? `<div class="pay-item"><div class="pay-lbl">Account Name</div><div class="pay-val">${esc(payAcName)}</div></div>` : ''}
    ${payAcNum ? `<div class="pay-item"><div class="pay-lbl">Account Number</div><div class="pay-val">${esc(payAcNum)}</div></div>` : ''}
    ${payRef ? `<div class="pay-item"><div class="pay-lbl">Reference</div><div class="pay-val">${esc(payRef)}</div></div>` : ''}
  </div></div>` : ''

  const footerHtml = `<div class="doc-footer">
    ${notes ? `<div class="doc-notes-lbl">Notes</div><div class="doc-notes-text">${esc(notes)}</div>` : ''}
    ${terms ? `<div class="doc-terms">${esc(terms)}</div>` : ''}
  </div>`

  const wm = `<div class="doc-watermark ${paid ? 'paid' : 'unpaid'}">${paid ? 'PAID' : 'UNPAID'}</div>`

  el.className = `inv-${template}`
  el.style.setProperty('--doc-accent', color)
  el.style.setProperty('--doc-display-font', `'${font}', sans-serif`)

  const bodyContent = (billBoxClass: string) => `
    <div class="doc-body">
      <div class="doc-parties">
        <div>
          <div class="party-lbl">From</div>
          <div class="party-name">${esc(bizName)}</div>
          <div class="party-detail">${bizContact}${bizAddrHtml}${taxLine}</div>
        </div>
        <div class="${billBoxClass}">
          ${chipHtml}
          <div class="party-lbl" style="margin-top:6px">Bill To</div>
          <div class="party-name">${esc(clName)}</div>
          <div class="party-detail">${clAddrHtml}${clEmail ? esc(clEmail) + '<br>' : ''}${clPhone ? esc(clPhone) : ''}${clRefHtml}</div>
        </div>
      </div>
      <table class="doc-table"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table>
      <div class="doc-totals"><div class="doc-totals-inner">${totHtml}</div></div>
    </div>
    ${payHtml}${footerHtml}`

  const headerClassic = `${wm}<div class="doc-header"><div>${logoHtml}</div><div class="doc-inv-badge"><div class="doc-inv-label">Invoice</div><div class="doc-inv-num">${esc(num)}</div><div class="doc-inv-date">Date: ${date}</div><div class="doc-inv-date">Due: ${due}</div></div></div>`
  const headerMinimal = `${wm}<div class="doc-header"><div>${logoHtml}</div><div class="doc-inv-badge"><div class="doc-inv-label">Invoice</div><div class="doc-inv-num">${esc(num)}</div><div class="doc-inv-date">${date} → ${due}</div></div></div><div class="doc-rule"></div>`

  if (template === 'classic') el.innerHTML = headerClassic + bodyContent('bill-to-box')
  else if (template === 'modern') el.innerHTML = headerClassic + bodyContent('bill-to-box')
  else el.innerHTML = headerMinimal + bodyContent('')
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function InvoiceStudio({
  businessName = '', businessEmail = '', businessPhone = '',
  businessAddress = '', businessLogoUrl, taxName = '', taxNumber = '',
  clientName = '', clientPhone = '', clientEmail = '', clientAddress = '', clientRef = '',
  invoiceNumber = 'INV-001', currency = 'IDR', issueDate, dueDate,
  initialItems, paymentBank = '', paymentAccountName = '', paymentAccountNumber = '',
  defaultNotes = 'Thank you for your order at rein.atelier! 🌸',
  defaultTerms = 'Payment is due within 14 days of receiving this invoice.',
  initialTemplate = 'classic', initialColor = '#a78bfa',
  initialFont = 'Instrument Sans', initialDateFormat = 'MMM D, YYYY',
  initialPaid = false, onDesignChange, onBack,
  orderForWhatsapp, settingsForWhatsapp,
}: InvoiceStudioProps) {

  const today = todayStr()
  const [state, setState] = useState<InvoiceState>({
    invoiceNumber, currency,
    issueDate: issueDate ?? today, dueDate: dueDate ?? today,
    bizName: businessName, bizEmail: businessEmail, bizPhone: businessPhone,
    bizAddr: businessAddress, bizTaxName: taxName, bizTaxNum: taxNumber,
    logoDataUrl: businessLogoUrl ?? null,
    clName: clientName, clEmail: clientEmail, clPhone: clientPhone,
    clAddr: clientAddress, clRef: clientRef,
    items: initialItems ?? [{ desc: '', sub: '', qty: 1, price: 0 }],
    discountPct: 0, taxName: 'PPN', taxPct: 0,
    payBank: paymentBank, payAcName: paymentAccountName,
    payAcNum: paymentAccountNumber, payRef: invoiceNumber,
    notes: defaultNotes, terms: defaultTerms,
    template: initialTemplate, color: initialColor,
    font: initialFont, dateFmt: initialDateFormat, paid: initialPaid,
  })

  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'design' | 'whatsapp'>('details')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const invoiceDocRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (invoiceDocRef.current) renderInvoiceDoc(state, invoiceDocRef.current) }, [state])

  useEffect(() => {
    onDesignChange?.({ invoice_template: state.template, invoice_color: state.color, invoice_font: state.font, invoice_date_format: state.dateFmt })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.template, state.color, state.font, state.dateFmt])

  const showToast = useCallback((text: string, ok = true) => { setToast({ text, ok }); setTimeout(() => setToast(null), 3000) }, [])
  const set = <K extends keyof InvoiceState>(k: K, v: InvoiceState[K]) => setState(prev => ({ ...prev, [k]: v }))

  const setItem = (i: number, field: keyof InvoiceItem, raw: string) => {
    const val = field === 'desc' || field === 'sub' ? raw : (parseFloat(raw) || 0)
    setState(prev => { const items = [...prev.items]; items[i] = { ...items[i], [field]: val }; return { ...prev, items } })
  }

  const addItem = () => setState(prev => ({ ...prev, items: [...prev.items, { desc: '', sub: '', qty: 1, price: 0 }] }))
  const delItem = (i: number) => setState(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('logoDataUrl', (ev.target?.result as string) ?? null)
    reader.readAsDataURL(file)
  }

  const exportPDF = async () => {
    setPdfLoading(true)
    const A4_PX = 794, A4_W_MM = 210, A4_H_MM = 297
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;overflow:visible;background:#fff;z-index:-999'
    const source = document.getElementById('invoice-doc'); if (!source) { setPdfLoading(false); return }
    const clone = source.cloneNode(true) as HTMLElement
    clone.querySelector('.doc-watermark')?.remove()
    clone.style.cssText = 'width:794px!important;box-shadow:none!important;border-radius:0!important;min-height:unset!important'
    clone.style.setProperty('--doc-accent', state.color)
    clone.style.setProperty('--doc-display-font', `'${state.font}', sans-serif`)
    wrapper.appendChild(clone); document.body.appendChild(wrapper)
    const probe = document.createElement('div')
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;opacity:0;font-size:12px'
    probe.innerHTML = `<span style="font-family:'Syne',sans-serif;font-weight:800">Ag</span><span style="font-family:'Instrument Sans',sans-serif;font-weight:600">Ag</span><span style="font-family:'Instrument Serif',serif">Ag</span>`
    document.body.appendChild(probe)
    await document.fonts.ready; await new Promise(r => setTimeout(r, 350)); probe.remove()
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, width: A4_PX, height: clone.scrollHeight, windowWidth: A4_PX, scrollX: 0, scrollY: 0 })
      const scale = canvas.width / A4_W_MM, pageHpx = Math.round(A4_H_MM * scale)
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      let offsetPx = 0, page = 0
      while (offsetPx < canvas.height) {
        const sliceHpx = Math.min(pageHpx, canvas.height - offsetPx)
        const strip = document.createElement('canvas'); strip.width = canvas.width; strip.height = sliceHpx
        const ctx = strip.getContext('2d')!; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, strip.width, strip.height)
        ctx.drawImage(canvas, 0, offsetPx, canvas.width, sliceHpx, 0, 0, canvas.width, sliceHpx)
        if (page > 0) pdf.addPage()
        pdf.addImage(strip.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, A4_W_MM, sliceHpx / scale)
        offsetPx += pageHpx; page++
      }
      pdf.save(`${state.invoiceNumber.replace(/[^a-z0-9\-_]/gi, '_')}_invoice.pdf`)
      showToast('PDF exported successfully ✓')
    } catch (err) {
      console.error(err); showToast('Export failed', false)
    } finally { document.body.removeChild(wrapper); setPdfLoading(false) }
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: T.bg, fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>

      <style dangerouslySetInnerHTML={{ __html: INVOICE_STYLES }} />
      <style>{`@keyframes is-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── TOPBAR ── */}
      <div style={{ height: 56, background: T.surface, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0, boxShadow: '0 1px 3px rgba(167,139,250,0.08)' }}>

        {/* Back button */}
        {onBack && (
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(30,30,34,0.88)', border: '1px solid #2a2a2e',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: '#9998a8',
            backdropFilter: 'blur(4px)', transition: 'all 0.15s', flexShrink: 0,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            Back
          </button>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, background: T.bg, borderRadius: 10, padding: 3, border: `1px solid ${T.border}` }}>
          {(['details', 'items', 'design', 'whatsapp'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 8, padding: '5px 18px',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              background: activeTab === tab ? T.surface : 'transparent',
              color: activeTab === tab ? T.text : T.textMuted,
              boxShadow: activeTab === tab ? '0 1px 3px rgba(167,139,250,0.12)' : 'none',
            }}>
              {tab === 'details' ? 'Details' : tab === 'items' ? 'Items' : tab === 'design' ? 'Design' : '💬 WhatsApp'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Paid toggle */}
        <button onClick={() => set('paid', !state.paid)} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: state.paid ? T.greenBg : T.redBg,
          border: `1px solid ${state.paid ? '#a7f3d0' : '#fecaca'}`,
          borderRadius: 20, padding: '5px 14px', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 600, color: state.paid ? T.green : T.red,
          transition: 'all 0.2s', fontFamily: 'inherit',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: state.paid ? T.green : T.red, display: 'inline-block' }} />
          {state.paid ? 'Paid' : 'Unpaid'}
        </button>

        {/* Print */}
        <button onClick={() => window.print()} style={{ ...ghostBtn }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" /></svg>
          Print
        </button>

        {/* Export PDF */}
        <button onClick={exportPDF} disabled={pdfLoading} style={{ ...primaryBtn, opacity: pdfLoading ? .65 : 1, cursor: pdfLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {pdfLoading
            ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'is-spin 0.7s linear infinite' }} />
            : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          {pdfLoading ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* ── WORKSPACE ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── EDITOR PANEL ── */}
        <div style={{ width: 380, minWidth: 340, background: T.surface, borderRight: `1px solid ${T.border}`, overflowY: 'auto', overflowX: 'hidden' }}>

          {/* DETAILS */}
          {activeTab === 'details' && (
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <Section title="Invoice Settings">
                <Row><Field label="Invoice No."><Input value={state.invoiceNumber} onChange={v => set('invoiceNumber', v)} /></Field>
                  <Field label="Currency"><Select value={state.currency} onChange={v => set('currency', v)} options={Object.entries(CURRENCIES).map(([k, s]) => ({ value: k, label: `${k} — ${s}` }))} /></Field></Row>
                <Row>
                  <Field label="Issue Date"><Input type="date" value={state.issueDate} onChange={v => set('issueDate', v)} /></Field>
                  <Field label="Due Date"><Input type="date" value={state.dueDate} onChange={v => set('dueDate', v)} /></Field>
                </Row>
              </Section>

              <Section title="Business Profile">
                <Field label="Logo">
                  <div style={{ border: `1.5px dashed ${T.borderStrong}`, borderRadius: 12, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', background: T.bg }}>
                    <input type="file" accept="image/*" onChange={handleLogo} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    {state.logoDataUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
                        <img src={state.logoDataUrl} alt="Logo" style={{ maxHeight: 44, maxWidth: 150, objectFit: 'contain', borderRadius: 4 }} />
                        <button onClick={e => { e.stopPropagation(); set('logoDataUrl', null) }} style={{ pointerEvents: 'all', background: T.redBg, border: '1px solid #fca5a5', borderRadius: '50%', width: 20, height: 20, color: T.red, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={T.textFaint} strokeWidth="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span style={{ fontSize: 12.5, color: T.textMuted, fontWeight: 500 }}>Click or drop logo</span>
                        <span style={{ fontSize: 11, color: T.textFaint }}>PNG, JPG max 2MB</span>
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Business Name"><Input value={state.bizName} onChange={v => set('bizName', v)} /></Field>
                <Row><Field label="Email"><Input type="email" value={state.bizEmail} onChange={v => set('bizEmail', v)} /></Field><Field label="Phone"><Input type="tel" value={state.bizPhone} onChange={v => set('bizPhone', v)} /></Field></Row>
                <Field label="Address"><Textarea value={state.bizAddr} onChange={v => set('bizAddr', v)} placeholder="123 Main St..." /></Field>
                <Row><Field label="Tax Name"><Input value={state.bizTaxName} onChange={v => set('bizTaxName', v)} placeholder="VAT" /></Field><Field label="Tax Number"><Input value={state.bizTaxNum} onChange={v => set('bizTaxNum', v)} /></Field></Row>
              </Section>

              <Section title="Client Details">
                <Field label="Client Name"><Input value={state.clName} onChange={v => set('clName', v)} /></Field>
                <Row><Field label="Email"><Input type="email" value={state.clEmail} onChange={v => set('clEmail', v)} /></Field><Field label="Phone"><Input type="tel" value={state.clPhone} onChange={v => set('clPhone', v)} /></Field></Row>
                <Field label="Address"><Textarea value={state.clAddr} onChange={v => set('clAddr', v)} /></Field>
                <Field label="Reference / PO Number"><Input value={state.clRef} onChange={v => set('clRef', v)} /></Field>
              </Section>
            </div>
          )}

          {/* ITEMS */}
          {activeTab === 'items' && (
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <Section title="Line Items">
                {state.items.map((it, i) => (
                  <div key={i} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: T.accentDark, background: T.accentLight, padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase' }}>Item {i + 1}</span>
                      <button onClick={() => delItem(i)} style={{ background: 'none', border: 'none', color: T.textFaint, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                        onMouseOver={e => (e.currentTarget.style.color = T.red)} onMouseOut={e => (e.currentTarget.style.color = T.textFaint)}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 84px', gap: 8, marginBottom: 8 }}>
                      <Field label="Description"><Input value={it.desc} onChange={v => setItem(i, 'desc', v)} placeholder="Item name" /></Field>
                      <Field label="Qty"><Input type="number" value={String(it.qty)} onChange={v => setItem(i, 'qty', v)} /></Field>
                      <Field label="Price"><Input type="number" value={String(it.price)} onChange={v => setItem(i, 'price', v)} /></Field>
                    </div>
                    <Field label="Sub-description (optional)">
                      <Input value={it.sub} onChange={v => setItem(i, 'sub', v)} placeholder="e.g. 10 stems in pink" style={{ color: T.textMuted, fontSize: 12.5 }} />
                    </Field>
                    <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: T.textMuted, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                      Total: <span style={{ color: T.accentDark, fontWeight: 700 }}>{fmtMoney(it.qty * it.price, state.currency)}</span>
                    </div>
                  </div>
                ))}
                <button onClick={addItem} style={{ background: 'none', border: `1.5px dashed ${T.borderStrong}`, borderRadius: 10, color: T.accent, fontSize: 13, fontWeight: 500, padding: '10px 0', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
                  onMouseOver={e => { e.currentTarget.style.background = T.accentLight }} onMouseOut={e => { e.currentTarget.style.background = 'none' }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>
                  Add Item
                </button>
              </Section>

              <Section title="Adjustments">
                <Row>
                  <Field label="Discount"><SuffixInput value={String(state.discountPct)} onChange={v => set('discountPct', parseFloat(v) || 0)} suffix="%" /></Field>
                  <Field label="Tax">
                    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                      <input value={state.taxName} onChange={e => set('taxName', e.target.value)} style={{ ...inputBase, maxWidth: 60, border: 'none', borderRadius: 0 }} />
                      <input type="number" value={String(state.taxPct)} onChange={e => set('taxPct', parseFloat(e.target.value) || 0)} style={{ ...inputBase, maxWidth: 52, border: 'none', borderRadius: 0 }} />
                      <span style={{ padding: '0 10px', fontSize: 12, fontWeight: 600, color: T.textMuted, background: T.bg, borderLeft: `1px solid ${T.border}`, minHeight: 38, display: 'flex', alignItems: 'center' }}>%</span>
                    </div>
                  </Field>
                </Row>
              </Section>

              <Section title="Payment Details">
                <Row><Field label="Bank Name"><Input value={state.payBank} onChange={v => set('payBank', v)} placeholder="Chase, HSBC…" /></Field><Field label="Account Name"><Input value={state.payAcName} onChange={v => set('payAcName', v)} /></Field></Row>
                <Row><Field label="Account Number"><Input value={state.payAcNum} onChange={v => set('payAcNum', v)} placeholder="1234-5678" /></Field><Field label="Transfer Reference"><Input value={state.payRef} onChange={v => set('payRef', v)} /></Field></Row>
              </Section>

              <Section title="Notes & Terms">
                <Field label="Notes"><Textarea value={state.notes} onChange={v => set('notes', v)} rows={3} /></Field>
                <Field label="Terms & Conditions"><Textarea value={state.terms} onChange={v => set('terms', v)} rows={3} /></Field>
              </Section>
            </div>
          )}

          {/* DESIGN */}
          {activeTab === 'design' && (
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <Section title="Template">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {(['classic', 'modern', 'minimal'] as const).map(tpl => (
                    <button key={tpl} onClick={() => set('template', tpl)} style={{ border: `2px solid ${state.template === tpl ? T.accent : T.border}`, borderRadius: 12, padding: '10px 8px 8px', cursor: 'pointer', background: state.template === tpl ? T.accentLight : T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
                      <div style={{ width: '100%', height: 60, borderRadius: 6, overflow: 'hidden', background: '#fff', border: `1px solid ${T.border}` }}>
                        {tpl === 'classic' && <div style={{ padding: 7, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}><div style={{ height: 3, borderRadius: 2, background: state.color }} /><div style={{ display: 'flex', gap: 4, marginTop: 4 }}><div style={{ background: '#ede9fe', flex: 1, height: 18, borderRadius: 3 }} /><div style={{ background: '#f5f5f5', flex: 1, height: 18, borderRadius: 3 }} /></div><div style={{ background: '#eee', height: 1, marginTop: 6 }} /><div style={{ display: 'flex', gap: 2, marginTop: 4 }}>{[1, 1, 1].map((_, i) => <div key={i} style={{ background: '#f0f0f0', flex: 1, height: 5, borderRadius: 2 }} />)}</div></div>}
                        {tpl === 'modern' && <div style={{ height: '100%' }}><div style={{ height: '38%', background: state.color }} /><div style={{ padding: '5px 7px', display: 'flex', flexDirection: 'column', gap: 3 }}><div style={{ height: 4, background: '#eee', borderRadius: 2, width: '60%' }} /><div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, width: '80%' }} /></div></div>}
                        {tpl === 'minimal' && <div style={{ padding: 7, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}><div style={{ height: 5, background: '#111', borderRadius: 2, width: '40%' }} /><div style={{ height: 1, background: '#e5e5e5', margin: '3px 0' }} /><div style={{ height: 3, background: '#eee', borderRadius: 2, width: '75%' }} /><div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, width: '55%' }} /></div>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: state.template === tpl ? T.accentDark : T.textMuted }}>{tpl.charAt(0).toUpperCase() + tpl.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Accent Color">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {['#a78bfa', '#111827', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map(c => (
                    <button key={c} onClick={() => set('color', c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${state.color === c ? '#fff' : 'transparent'}`, boxShadow: state.color === c ? `0 0 0 2px ${c}` : '0 1px 3px rgba(0,0,0,0.12)', cursor: 'pointer', transition: 'transform 0.12s' }} onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.15)')} onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
                    <span>Custom</span>
                    <input type="color" value={state.color} onChange={e => set('color', e.target.value)} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${T.border}`, padding: 0, cursor: 'pointer' }} />
                  </div>
                </div>
              </Section>

              <Section title="Typography">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[{ id: 'Instrument Sans', label: 'Instrument Sans', tag: 'Clean', ff: "'Instrument Sans', sans-serif" }, { id: 'Syne', label: 'Syne', tag: 'Bold', ff: "'Syne', sans-serif" }, { id: 'Instrument Serif', label: 'Instrument Serif', tag: 'Elegant', ff: "'Instrument Serif', serif" }].map(f => (
                    <button key={f.id} onClick={() => set('font', f.id)} style={{ padding: '10px 14px', border: `1.5px solid ${state.font === f.id ? T.accent : T.border}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: state.font === f.id ? T.accentLight : '#fff', fontFamily: f.ff }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: state.font === f.id ? T.accentDark : T.text }}>{f.label}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: state.font === f.id ? '#ddd6fe' : T.bg, color: state.font === f.id ? T.accentDark : T.textMuted, fontFamily: 'inherit' }}>{f.tag}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Date Format">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[{ fmt: 'MMM D, YYYY', label: 'Jan 15, 2025' }, { fmt: 'DD/MM/YYYY', label: '15/01/2025' }, { fmt: 'MM/DD/YYYY', label: '01/15/2025' }, { fmt: 'YYYY-MM-DD', label: '2025-01-15' }].map(({ fmt, label }) => (
                    <button key={fmt} onClick={() => set('dateFmt', fmt)} style={{ padding: '10px 8px', border: `1.5px solid ${state.dateFmt === fmt ? T.accent : T.border}`, borderRadius: 10, cursor: 'pointer', fontSize: 12.5, fontWeight: state.dateFmt === fmt ? 600 : 400, textAlign: 'center', transition: 'all 0.15s', color: state.dateFmt === fmt ? T.accentDark : T.textMuted, background: state.dateFmt === fmt ? T.accentLight : '#fff', fontFamily: 'inherit' }}>{label}</button>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div style={{ padding: '24px 20px' }}>
              {orderForWhatsapp && settingsForWhatsapp
                ? <WhatsappGenerator order={orderForWhatsapp} settings={settingsForWhatsapp} />
                : <p style={{ color: T.textMuted, fontSize: 13 }}>WhatsApp data not available.</p>
              }
            </div>
          )}
        </div>

        {/* ── PREVIEW PANEL ── */}
        <div style={{ flex: 1, background: '#f0eeff', backgroundImage: 'radial-gradient(circle at 60% 30%, rgba(167,139,250,0.07) 0%, transparent 60%)', overflowY: 'auto', overflowX: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '36px 32px' }}>
          <div id="invoice-doc" ref={invoiceDocRef} className={`inv-${state.template}`} />
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#fff', color: T.text, border: `1px solid ${T.border}`, padding: '12px 18px', borderRadius: 12, fontSize: 13.5, fontWeight: 500, boxShadow: '0 8px 24px rgba(167,139,250,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={toast.ok ? T.green : T.red} strokeWidth="2.5">{toast.ok ? <path d="M5 13l4 4L19 7" /> : <path d="M6 18L18 6M6 6l12 12" />}</svg>
          {toast.text}
        </div>
      )}
    </div>
  )
}

// ─── SHARED STYLE OBJECTS ─────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13.5, color: '#111',
  background: '#fff', border: `1px solid ${T.border}`,
  borderRadius: 8, padding: '8px 11px', width: '100%',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  WebkitAppearance: 'none',
}

const ghostBtn: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
  border: `1px solid ${T.border}`, borderRadius: 8,
  padding: '7px 16px', cursor: 'pointer',
  background: '#fff', color: T.textMuted,
  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
}

const primaryBtn: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
  border: 'none', borderRadius: 8, padding: '7px 18px', cursor: 'pointer',
  background: T.accent, color: '#fff',
  boxShadow: `0 2px 8px ${T.accentGlow}`, transition: 'all 0.15s',
}

// ─── TINY UI COMPONENTS ───────────────────────────────────────────────────────

function Input({ value, onChange, type = 'text', placeholder, style }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; style?: React.CSSProperties
}) {
  return <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
    style={{ ...inputBase, ...style }}
    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}` }}
    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }} />
}

function Textarea({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return <textarea value={value} placeholder={placeholder} rows={rows} onChange={e => onChange(e.target.value)}
    style={{ ...inputBase, resize: 'vertical', minHeight: 72, lineHeight: 1.5 }}
    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}` }}
    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }} />
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return <select value={value} onChange={e => onChange(e.target.value)}
    style={{ ...inputBase, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 30 }}
    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}` }}
    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
}

function SuffixInput({ value, onChange, suffix }: { value: string; onChange: (v: string) => void; suffix: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} style={{ ...inputBase, border: 'none', borderRadius: 0, flex: 1 }} />
      <span style={{ padding: '0 10px', fontSize: 12, fontWeight: 600, color: T.textMuted, background: T.bg, borderLeft: `1px solid ${T.border}`, minHeight: 38, display: 'flex', alignItems: 'center' }}>{suffix}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: T.textFaint, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>{title}</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 0 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 10 }}>{children}</div>
}