import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown, Search, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { adminListOrders, adminGetOrder } from '../api';
import { INVOICING_ENABLED } from '../../../shared/lib/features';

/* ── Design tokens (mismos que la página) ─────────────────────── */
const INK      = '#0A0A0B';
const PANEL    = '#0F0F12';
const CARBON   = '#15151B';
const HAIRLINE = 'rgba(245,245,240,0.07)';
const HAIRLINE_STRONG = 'rgba(245,245,240,0.14)';
const CREAM    = '#F5F5F0';
const MUTED    = 'rgba(245,245,240,0.55)';
const FAINT    = 'rgba(245,245,240,0.32)';
const ACCENT   = '#A3FF7C';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fMono    = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody    = "'Inter', system-ui, sans-serif";

/* Logo de marca: gota verde inline (sin dependencia de URL externa → no taint CORS) */
const DROP_LOGO = `
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5C12 2.5 4.5 11 4.5 16a7.5 7.5 0 0 0 15 0c0-5-7.5-13.5-7.5-13.5z" fill="${ACCENT}"/>
    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  </svg>`;

/* ── HTML del documento (tema oscuro, ancho A4 @96dpi = 794px) ── */
const buildQuoteHTML = (order) => {
  const id    = String(order.id ?? order.id_salesorder).padStart(6, '0');
  const lines = order.lines ?? order.salesorderline_set ?? [];
  const total = lines.reduce(
    (s, l) => s + parseFloat(l.price_subtotal ?? l.price_unit * l.product_qty ?? 0), 0
  );

  const now = new Date();
  const exp = new Date();
  exp.setDate(exp.getDate() + 1);

  const fmtDate = (d) => d.toLocaleDateString('es-PE');
  const fmtTime = (d) => d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const money   = (n) => parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = lines.map((l, i) => `
    <tr style="border-bottom:1px solid ${HAIRLINE};">
      <td style="padding:14px 16px;font-family:${fBody};font-size:13px;font-weight:500;color:${CREAM};">
        ${l.product_name || `Producto #${l.product_id ?? l.product}`}
      </td>
      <td style="padding:14px 16px;text-align:center;font-family:${fMono};font-size:13px;color:${ACCENT};">
        ${l.product_qty}
      </td>
      <td style="padding:14px 16px;text-align:right;font-family:${fMono};font-size:13px;color:${MUTED};">
        S/ ${money(l.price_unit)}
      </td>
      <td style="padding:14px 16px;text-align:right;font-family:${fMono};font-size:13px;font-weight:700;color:${CREAM};">
        S/ ${money(l.price_subtotal ?? l.price_unit * l.product_qty)}
      </td>
    </tr>`).join('');

  const micro = (txt, color = FAINT) =>
    `<span style="font-family:${fMono};font-size:10px;font-weight:400;letter-spacing:0.22em;text-transform:uppercase;color:${color};">${txt}</span>`;

  return `
  <div style="width:794px;background:${INK};padding:48px;box-sizing:border-box;font-family:${fBody};color:${CREAM};">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:28px;border-bottom:1px solid ${HAIRLINE};">
      <div style="display:flex;align-items:center;gap:14px;">
        ${DROP_LOGO}
        <div>
          <div style="font-family:${fDisplay};font-weight:600;font-size:22px;letter-spacing:-0.02em;color:${CREAM};line-height:1;">Armalo</div>
          <div style="margin-top:6px;">${micro(INVOICING_ENABLED ? 'S.A.C.S · RUC 20613999818' : 'Lima · Perú')}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:${fDisplay};font-weight:300;font-size:30px;letter-spacing:-0.03em;color:${CREAM};line-height:1;">
          Coti<strong style="font-weight:600;">zación</strong>
        </div>
        <div style="margin-top:10px;display:flex;gap:18px;justify-content:flex-end;">
          <div>${micro('Nro')}<div style="font-family:${fMono};font-size:13px;color:${CREAM};margin-top:3px;">#${id}</div></div>
          <div>${micro('Fecha')}<div style="font-family:${fMono};font-size:13px;color:${CREAM};margin-top:3px;">${fmtDate(now)}</div></div>
        </div>
      </div>
    </div>

    <!-- Vigencia -->
    <div style="margin-top:20px;display:flex;align-items:center;gap:10px;">
      <div style="width:24px;height:1px;background:rgba(163,255,124,0.65);"></div>
      ${micro(`Válida hasta ${fmtDate(exp)} · ${fmtTime(exp)}`, ACCENT)}
    </div>

    <!-- Tabla -->
    <table style="width:100%;border-collapse:collapse;margin-top:28px;background:${PANEL};border:1px solid ${HAIRLINE};">
      <thead>
        <tr style="border-bottom:1px solid ${HAIRLINE_STRONG};">
          <th style="padding:13px 16px;text-align:left;font-family:${fMono};font-size:10px;font-weight:400;letter-spacing:0.16em;text-transform:uppercase;color:${FAINT};">Descripción</th>
          <th style="padding:13px 16px;text-align:center;width:70px;font-family:${fMono};font-size:10px;font-weight:400;letter-spacing:0.16em;text-transform:uppercase;color:${FAINT};">Cant.</th>
          <th style="padding:13px 16px;text-align:right;width:110px;font-family:${fMono};font-size:10px;font-weight:400;letter-spacing:0.16em;text-transform:uppercase;color:${FAINT};">P. Unit.</th>
          <th style="padding:13px 16px;text-align:right;width:120px;font-family:${fMono};font-size:10px;font-weight:400;letter-spacing:0.16em;text-transform:uppercase;color:${FAINT};">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Total -->
    <div style="margin-top:24px;display:flex;justify-content:flex-end;">
      <div style="min-width:280px;border-top:1px solid ${HAIRLINE_STRONG};padding-top:18px;display:flex;align-items:baseline;justify-content:space-between;">
        ${micro('Total')}
        <div style="display:flex;align-items:baseline;gap:6px;">
          <span style="font-family:${fMono};font-size:14px;color:${MUTED};">S/</span>
          <span style="font-family:${fDisplay};font-size:38px;font-weight:500;letter-spacing:-0.035em;color:${CREAM};line-height:1;">${money(total)}</span>
        </div>
      </div>
    </div>

    <!-- Footer info -->
    <div style="margin-top:40px;padding-top:28px;border-top:1px solid ${HAIRLINE};display:grid;grid-template-columns:1fr 1fr;gap:0;background:${CARBON};border:1px solid ${HAIRLINE};">
      <div style="padding:24px;border-right:1px solid ${HAIRLINE};">
        <div style="margin-bottom:14px;">${micro('Datos bancarios')}</div>
        <div style="font-family:${fBody};font-size:13px;color:${MUTED};margin-bottom:10px;">Banco <span style="color:${CREAM};">Interbank</span></div>
        <div style="font-family:${fBody};font-size:11px;color:${FAINT};margin-bottom:4px;">Cuenta corriente</div>
        <div style="font-family:${fMono};font-size:13px;color:${ACCENT};margin-bottom:14px;">200-3007136275</div>
        <div style="font-family:${fBody};font-size:11px;color:${FAINT};margin-bottom:4px;">CCI</div>
        <div style="font-family:${fMono};font-size:13px;color:${ACCENT};">003-200-003007136275-37</div>
      </div>
      <div style="padding:24px;">
        <div style="margin-bottom:14px;">${micro('Programa de referidos')}</div>
        <div style="font-family:${fBody};font-size:13px;color:${MUTED};line-height:1.6;margin-bottom:10px;">Gana <span style="color:${CREAM};font-weight:600;">S/50</span> por cada referido que compre.</div>
        <div style="font-family:${fBody};font-size:12px;color:${MUTED};line-height:1.7;">· Descuento de S/20 para nuevos clientes<br/>· Niveles con mayores ganancias</div>
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid ${HAIRLINE};font-family:${fMono};font-size:11px;color:${ACCENT};letter-spacing:0.04em;">armalo.com/referidos</div>
      </div>
    </div>

    <!-- Cierre -->
    <div style="margin-top:24px;text-align:center;">
      ${micro('Pago seguro · Coordinamos por WhatsApp · facebook.com/armalo.com · @armalo')}
    </div>
  </div>`;
};

/* ── Generación del PDF (jsPDF + html2canvas, lado cliente) ────── */
const generateQuotationPDF = async (order) => {
  const id = String(order.id ?? order.id_salesorder).padStart(6, '0');

  // Nodo offscreen renderizado con los estilos de marca
  const holder = document.createElement('div');
  holder.style.position = 'fixed';
  holder.style.left = '-10000px';
  holder.style.top = '0';
  holder.style.zIndex = '-1';
  holder.innerHTML = buildQuoteHTML(order);
  document.body.appendChild(holder);
  const node = holder.firstElementChild;

  try {
    // Asegura que las fuentes de marca estén listas antes de capturar
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: INK,
      useCORS: true,
      logging: false,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH  = (canvas.height * pageW) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let heightLeft = imgH;
    let position = 0;

    // Relleno oscuro para cualquier área de página sin imagen
    pdf.setFillColor(10, 10, 11);
    pdf.rect(0, 0, pageW, pageH, 'F');
    pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.setFillColor(10, 10, 11);
      pdf.rect(0, 0, pageW, pageH, 'F');
      pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH);
      heightLeft -= pageH;
    }

    pdf.save(`Cotizacion-${id}.pdf`);
  } finally {
    document.body.removeChild(holder);
  }
};

/* ── Page ─────────────────────────────────────────────────────── */
const QuotePrintPage = () => {
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', ''],
    queryFn: () => adminListOrders(''),
  });

  const { data: order } = useQuery({
    queryKey: ['admin-order', selectedId],
    queryFn: () => adminGetOrder(selectedId),
    enabled: !!selectedId,
  });

  const filtered = orders.filter(o => {
    if (!q) return true;
    return String(o.id ?? o.id_salesorder).includes(q.trim());
  });

  const lines = order ? (order.lines ?? order.salesorderline_set ?? []) : [];
  const total = lines.reduce((s, l) => s + parseFloat(l.price_subtotal ?? l.price_unit * l.product_qty ?? 0), 0);

  const handleDownload = async () => {
    if (!order || generating) return;
    setGenerating(true);
    try {
      await generateQuotationPDF(order);
    } catch (e) {
      console.error('Error generando PDF', e);
      alert('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-faint mb-1">Administración</p>
        <h1 className="font-display text-2xl font-semibold text-brand-text tracking-tight">Cotizaciones</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Selector */}
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-faint" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por número de orden…"
              className="w-full bg-brand-surface border border-brand-border-md pl-9 pr-4 py-2.5 text-[13px] text-brand-text placeholder-brand-faint outline-none focus:border-brand-accent transition-colors"
            />
          </div>
          <div className="border border-brand-border overflow-hidden max-h-[520px] overflow-y-auto">
            {isLoading ? (
              <div className="py-10 text-center font-mono text-[11px] text-brand-faint tracking-widest uppercase">Cargando…</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-brand-muted text-[13px]">Sin resultados</div>
            ) : filtered.map(o => {
              const id = o.id ?? o.id_salesorder;
              const active = selectedId === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-brand-border text-[13px] transition-colors ${active ? 'bg-brand-accent/5 text-brand-accent' : 'text-brand-text hover:bg-brand-surface/60'}`}
                >
                  <div>
                    <span className="font-mono">#{String(id).padStart(6,'0')}</span>
                    {o.created_at && (
                      <span className={`ml-3 text-[11px] ${active ? 'text-brand-accent/70' : 'text-brand-faint'}`}>
                        {new Date(o.created_at).toLocaleDateString('es-PE')}
                      </span>
                    )}
                  </div>
                  <span className={active ? 'text-brand-accent font-semibold' : 'text-brand-muted'}>
                    S/ {parseFloat(o.total ?? o.amount_total ?? 0).toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div>
          {!selectedId ? (
            <div className="border border-brand-border-md border-dashed flex items-center justify-center h-64 text-brand-faint text-[13px]">
              Selecciona una orden para previsualizar
            </div>
          ) : !order ? (
            <div className="border border-brand-border flex items-center justify-center h-64 font-mono text-[11px] text-brand-faint tracking-widest uppercase">
              Cargando…
            </div>
          ) : (
            <>
              <button
                onClick={handleDownload}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 mb-4 bg-brand-accent text-brand-bg text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                {generating ? 'Generando PDF…' : 'Descargar PDF'}
              </button>

              {/* Mini preview — tema oscuro de marca */}
              <div style={{ background: INK, border: `1px solid ${HAIRLINE_STRONG}`, padding: 24, fontFamily: fBody }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: `1px solid ${HAIRLINE}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span dangerouslySetInnerHTML={{ __html: DROP_LOGO }} />
                    <div>
                      <div style={{ fontFamily: fDisplay, fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em', color: CREAM }}>Armalo</div>
                      <div style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: FAINT, marginTop: 3 }}>{INVOICING_ENABLED ? 'RUC 20613999818' : 'Lima · Perú'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: fDisplay, fontWeight: 300, fontSize: 18, color: CREAM, letterSpacing: '-0.02em' }}>Coti<strong style={{ fontWeight: 600 }}>zación</strong></div>
                    <div style={{ fontFamily: fMono, fontSize: 11, color: MUTED, marginTop: 4 }}>#{String(order.id ?? order.id_salesorder).padStart(6,'0')} · {new Date().toLocaleDateString('es-PE')}</div>
                  </div>
                </div>

                {/* Tabla */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, background: PANEL, border: `1px solid ${HAIRLINE}` }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${HAIRLINE_STRONG}` }}>
                      <th style={{ padding: '9px 10px', textAlign: 'left', fontFamily: fMono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, fontWeight: 400 }}>Descripción</th>
                      <th style={{ padding: '9px 10px', textAlign: 'center', fontFamily: fMono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, fontWeight: 400 }}>Cant.</th>
                      <th style={{ padding: '9px 10px', textAlign: 'right', fontFamily: fMono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, fontWeight: 400 }}>P. Unit.</th>
                      <th style={{ padding: '9px 10px', textAlign: 'right', fontFamily: fMono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, fontWeight: 400 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                        <td style={{ padding: '10px', fontFamily: fBody, fontSize: 12, fontWeight: 500, color: CREAM }}>{l.product_name || `Producto #${l.product_id ?? l.product}`}</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontFamily: fMono, fontSize: 12, color: ACCENT }}>{l.product_qty}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: fMono, fontSize: 12, color: MUTED }}>S/ {parseFloat(l.price_unit).toFixed(2)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: fMono, fontSize: 12, fontWeight: 700, color: CREAM }}>S/ {parseFloat(l.price_subtotal ?? l.price_unit * l.product_qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ minWidth: 200, borderTop: `1px solid ${HAIRLINE_STRONG}`, paddingTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: fMono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: FAINT }}>Total</span>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: fMono, fontSize: 12, color: MUTED }}>S/</span>
                      <span style={{ fontFamily: fDisplay, fontSize: 26, fontWeight: 500, letterSpacing: '-0.035em', color: CREAM }}>{total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotePrintPage;
