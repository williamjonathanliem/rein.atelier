// Invoice document CSS — scoped under #invoice-doc to avoid leaking into dashboard.
// Injected as a <style> tag in the invoice page head.
// IMPORTANT: These styles are intentional and must not be moved to global CSS.

export const INVOICE_DOC_CSS = `
/* ─── INVOICE DOC BASE ─────────────────────────────────────────── */
#invoice-doc {
  width: 720px;
  background: #fff;
  color: #111;
  font-family: 'Instrument Sans', sans-serif !important;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  position: relative;
  --doc-accent: #a78bfa;
  --doc-display-font: 'Instrument Sans', sans-serif;
}

/* Status watermark */
#invoice-doc .doc-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-family: 'Syne', sans-serif;
  font-size: 96px;
  font-weight: 800;
  letter-spacing: 8px;
  text-transform: uppercase;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
  user-select: none;
}
#invoice-doc .doc-watermark.paid  { color: rgba(52,211,153,0.12); opacity: 1; }
#invoice-doc .doc-watermark.unpaid { color: rgba(248,113,113,0.08); opacity: 1; }

/* ─── CLASSIC ─────────────────────────────────────────────────── */
#invoice-doc.inv-classic .doc-header {
  padding: 44px 52px 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2.5px solid var(--doc-accent);
}
#invoice-doc.inv-classic .doc-logo-img {
  max-height: 56px;
  max-width: 140px;
  object-fit: contain;
}
#invoice-doc.inv-classic .doc-logo-text {
  font-family: var(--doc-display-font);
  font-size: 26px;
  font-weight: 800;
  color: #111;
}
#invoice-doc.inv-classic .doc-inv-badge { text-align: right; }
#invoice-doc.inv-classic .doc-inv-label {
  font-family: 'Syne', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: rgba(0,0,0,0.06);
  line-height: 1;
  text-transform: uppercase;
}
#invoice-doc.inv-classic .doc-inv-num  { font-size: 13px; font-weight: 700; color: #111; margin-top: 4px; }
#invoice-doc.inv-classic .doc-inv-date { font-size: 12px; color: #777; margin-top: 2px; }
#invoice-doc.inv-classic .doc-body { padding: 28px 52px; }
#invoice-doc.inv-classic .doc-parties {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
}
#invoice-doc.inv-classic .party-lbl {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--doc-accent);
  margin-bottom: 7px;
}
#invoice-doc.inv-classic .party-name  { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 3px; }
#invoice-doc.inv-classic .party-detail { font-size: 12px; color: #666; line-height: 1.65; }
#invoice-doc.inv-classic .bill-to-box { background: #f8f7ff; border-radius: 10px; padding: 16px 18px; }

/* ─── MODERN ──────────────────────────────────────────────────── */
#invoice-doc.inv-modern .doc-header {
  background: var(--doc-accent);
  padding: 36px 52px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #fff;
}
#invoice-doc.inv-modern .doc-logo-img  { max-height: 52px; max-width: 130px; object-fit: contain; filter: brightness(0) invert(1); }
#invoice-doc.inv-modern .doc-logo-text { font-family: var(--doc-display-font); font-size: 24px; font-weight: 800; color: #fff; }
#invoice-doc.inv-modern .doc-inv-badge { text-align: right; }
#invoice-doc.inv-modern .doc-inv-label { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: rgba(255,255,255,0.2); text-transform: uppercase; }
#invoice-doc.inv-modern .doc-inv-num  { font-size: 13px; font-weight: 700; color: #fff; margin-top: 4px; }
#invoice-doc.inv-modern .doc-inv-date { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px; }
#invoice-doc.inv-modern .doc-body { padding: 28px 52px; }
#invoice-doc.inv-modern .doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
#invoice-doc.inv-modern .party-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--doc-accent); margin-bottom: 7px; }
#invoice-doc.inv-modern .party-name  { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 3px; }
#invoice-doc.inv-modern .party-detail { font-size: 12px; color: #666; line-height: 1.65; }
#invoice-doc.inv-modern .bill-to-box { border-left: 3px solid var(--doc-accent); padding-left: 16px; }

/* ─── MINIMAL ─────────────────────────────────────────────────── */
#invoice-doc.inv-minimal .doc-header {
  padding: 44px 52px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
#invoice-doc.inv-minimal .doc-logo-img  { max-height: 52px; max-width: 130px; object-fit: contain; }
#invoice-doc.inv-minimal .doc-logo-text { font-family: var(--doc-display-font); font-size: 22px; font-weight: 800; color: #111; }
#invoice-doc.inv-minimal .doc-inv-badge { text-align: right; }
#invoice-doc.inv-minimal .doc-inv-label { font-family: 'Instrument Sans', monospace; font-size: 10px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #bbb; }
#invoice-doc.inv-minimal .doc-inv-num  { font-size: 20px; font-weight: 800; color: #111; margin-top: 2px; }
#invoice-doc.inv-minimal .doc-inv-date { font-size: 12px; color: #888; margin-top: 2px; }
#invoice-doc.inv-minimal .doc-rule { height: 1px; background: #e5e5e5; margin: 0 52px; }
#invoice-doc.inv-minimal .doc-body { padding: 28px 52px; }
#invoice-doc.inv-minimal .doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
#invoice-doc.inv-minimal .party-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; margin-bottom: 6px; }
#invoice-doc.inv-minimal .party-name  { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 3px; }
#invoice-doc.inv-minimal .party-detail { font-size: 12px; color: #888; line-height: 1.65; }

/* ─── STATUS CHIP (shared) ───────────────────────────────────── */
#invoice-doc .inv-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 20px;
  margin-bottom: 4px;
}
#invoice-doc .chip-paid   { background: rgba(52,211,153,0.12); color: #059669; }
#invoice-doc .chip-unpaid { background: rgba(248,113,113,0.12); color: #dc2626; }
#invoice-doc .chip-dot { width: 5px; height: 5px; border-radius: 50%; }
#invoice-doc .chip-dot-paid   { background: #059669; }
#invoice-doc .chip-dot-unpaid { background: #dc2626; }

/* ─── TABLE (shared) ─────────────────────────────────────────── */
#invoice-doc .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
#invoice-doc .doc-table thead tr { background: var(--doc-accent); }
#invoice-doc.inv-minimal .doc-table thead tr { background: #111; }
#invoice-doc .doc-table th {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  padding: 10px 14px;
  text-align: left;
}
#invoice-doc .doc-table th:nth-child(3),
#invoice-doc .doc-table th:nth-child(4),
#invoice-doc .doc-table th:nth-child(5) { text-align: right; }
#invoice-doc .doc-table td { padding: 10px 14px; font-size: 13px; color: #222; border-bottom: 1px solid #f0f0f0; font-family: 'Instrument Sans', sans-serif !important; }
#invoice-doc .doc-table td:nth-child(3),
#invoice-doc .doc-table td:nth-child(4),
#invoice-doc .doc-table td:nth-child(5) { text-align: right; }
#invoice-doc .doc-table td.td-sub { padding-top: 0; font-size: 11.5px; color: #888; padding-bottom: 10px; }
#invoice-doc .doc-table tr:nth-child(even) td:not(.td-sub) { background: #fafafa; }

/* ─── TOTALS (shared) ────────────────────────────────────────── */
#invoice-doc .doc-totals { display: flex; justify-content: flex-end; margin-bottom: 4px; }
#invoice-doc .doc-totals-inner { min-width: 260px; }
#invoice-doc .tot-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 14px;
  font-size: 13px;
  gap: 16px;
}
#invoice-doc .tot-row .tot-l { color: #777; font-weight: 500; white-space: nowrap; }
#invoice-doc .tot-row .tot-r { font-weight: 600; color: #222; white-space: nowrap; }
#invoice-doc .tot-row.disc .tot-r { color: #dc2626; }
#invoice-doc .tot-divider { height: 1px; background: #e5e5e5; margin: 8px 14px; }
#invoice-doc .tot-row.grand {
  background: var(--doc-accent);
  border-radius: 8px;
  margin: 0 8px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-family: 'Instrument Sans', sans-serif !important;
}
#invoice-doc .tot-row.grand .tot-l { color: rgba(255,255,255,0.8); font-weight: 600; white-space: nowrap; font-family: 'Instrument Sans', sans-serif !important; }
#invoice-doc .tot-row.grand .tot-r { color: #fff; font-size: 16px; font-weight: 800; white-space: nowrap; font-family: 'Instrument Sans', sans-serif !important; }
#invoice-doc.inv-minimal .tot-row.grand { background: #111; }

/* ─── PAYMENT & FOOTER (shared) ─────────────────────────────── */
#invoice-doc .doc-payment { padding: 20px 52px; border-top: 1px solid #f0f0f0; }
#invoice-doc .pay-title { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #bbb; margin-bottom: 10px; }
#invoice-doc .pay-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
#invoice-doc .pay-item .pay-lbl { font-size: 10px; color: #aaa; font-weight: 500; margin-bottom: 2px; }
#invoice-doc .pay-item .pay-val { font-size: 13px; font-weight: 600; color: #333; }
#invoice-doc .doc-footer { padding: 20px 52px 36px; }
#invoice-doc .doc-notes-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #bbb; margin-bottom: 5px; }
#invoice-doc .doc-notes-text { font-size: 13px; color: #555; line-height: 1.6; margin-bottom: 14px; }
#invoice-doc .doc-terms { font-size: 11.5px; color: #aaa; line-height: 1.6; border-top: 1px solid #f0f0f0; padding-top: 12px; }
`
