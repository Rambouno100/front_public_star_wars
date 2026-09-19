import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

/* Logo de marca: gota verde inline (sin URL externa → no taint CORS) */
const DROP_LOGO = `
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5C12 2.5 4.5 11 4.5 16a7.5 7.5 0 0 0 15 0c0-5-7.5-13.5-7.5-13.5z" fill="${ACCENT}"/>
    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  </svg>`;

const micro = (txt, color = FAINT) =>
  `<span style="font-family:${fMono};font-size:10px;font-weight:400;letter-spacing:0.22em;text-transform:uppercase;color:${color};">${txt}</span>`;

const buildQuoteHTML = (order) => {
  const id = order.id != null ? order.id.toString().padStart(6, '0') : '------';
  const lines = order.lines ?? [];
  const total = lines.reduce((sum, line) => sum + (line.qty * line.price), 0);

  const now = new Date();
  const exp = new Date();
  exp.setDate(exp.getDate() + 1);

  const fmtDate = (d) => d.toLocaleDateString('es-PE');
  const fmtTime = (d) => d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const money   = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = lines.map(line => `
    <tr style="border-bottom:1px solid ${HAIRLINE};">
      <td style="padding:14px 16px;font-family:${fBody};font-size:13px;font-weight:500;color:${CREAM};">${line.product}</td>
      <td style="padding:14px 16px;text-align:center;font-family:${fMono};font-size:13px;color:${ACCENT};">${line.qty}</td>
      <td style="padding:14px 16px;text-align:right;font-family:${fMono};font-size:13px;color:${MUTED};">S/ ${money(line.price)}</td>
      <td style="padding:14px 16px;text-align:right;font-family:${fMono};font-size:13px;font-weight:700;color:${CREAM};">S/ ${money(line.qty * line.price)}</td>
    </tr>`).join('');

  return `
  <div style="width:794px;background:${INK};padding:48px;box-sizing:border-box;font-family:${fBody};color:${CREAM};">

    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:28px;border-bottom:1px solid ${HAIRLINE};">
      <div style="display:flex;align-items:center;gap:14px;">
        ${DROP_LOGO}
        <div>
          <div style="font-family:${fDisplay};font-weight:600;font-size:22px;letter-spacing:-0.02em;color:${CREAM};line-height:1;">Armalo</div>
          <div style="margin-top:6px;">${micro(INVOICING_ENABLED ? 'S.A.C.S · RUC 20613999818' : 'Lima · Perú')}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:${fDisplay};font-weight:300;font-size:30px;letter-spacing:-0.03em;color:${CREAM};line-height:1;">Coti<strong style="font-weight:600;">zación</strong></div>
        <div style="margin-top:10px;display:flex;gap:18px;justify-content:flex-end;">
          <div>${micro('Nro')}<div style="font-family:${fMono};font-size:13px;color:${CREAM};margin-top:3px;">#${id}</div></div>
          <div>${micro('Fecha')}<div style="font-family:${fMono};font-size:13px;color:${CREAM};margin-top:3px;">${fmtDate(now)}</div></div>
        </div>
      </div>
    </div>

    <div style="margin-top:20px;display:flex;align-items:center;gap:10px;">
      <div style="width:24px;height:1px;background:rgba(163,255,124,0.65);"></div>
      ${micro(`Válida hasta ${fmtDate(exp)} · ${fmtTime(exp)}`, ACCENT)}
    </div>

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

    <div style="margin-top:24px;display:flex;justify-content:flex-end;">
      <div style="min-width:280px;border-top:1px solid ${HAIRLINE_STRONG};padding-top:18px;display:flex;align-items:baseline;justify-content:space-between;">
        ${micro('Total')}
        <div style="display:flex;align-items:baseline;gap:6px;">
          <span style="font-family:${fMono};font-size:14px;color:${MUTED};">S/</span>
          <span style="font-family:${fDisplay};font-size:38px;font-weight:500;letter-spacing:-0.035em;color:${CREAM};line-height:1;">${money(total)}</span>
        </div>
      </div>
    </div>

    <div style="margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:0;background:${CARBON};border:1px solid ${HAIRLINE};">
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

    <div style="margin-top:24px;text-align:center;">
      ${micro('Pago seguro · Coordinamos por WhatsApp · facebook.com/armalo.com · @armalo')}
    </div>
  </div>`;
};

/* Genera y descarga el PDF (jsPDF + html2canvas, lado cliente) */
export const printQuotation = async (order) => {
  const id = order.id != null ? order.id.toString().padStart(6, '0') : 'cotizacion';

  const holder = document.createElement('div');
  holder.style.position = 'fixed';
  holder.style.left = '-10000px';
  holder.style.top = '0';
  holder.style.zIndex = '-1';
  holder.innerHTML = buildQuoteHTML(order);
  document.body.appendChild(holder);
  const node = holder.firstElementChild;

  try {
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
