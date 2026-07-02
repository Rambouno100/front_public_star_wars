import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DireccionEnvio from '../../checkout/components/DireccionEnvio';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCurrentCart, useCart } from '../hooks/useCart';
import client from '../../../shared/api/client';

/* ── Design tokens (temáticos — ver src/index.css) ─────────────── */
const INK      = 'var(--bg-ink)';
const PANEL    = 'var(--bg-panel)';
const ELEV     = 'var(--bg-elev)';
const HAIRLINE = 'var(--hairline)';
const HAIRLINE_STRONG = 'var(--hairline-strong)';
const CREAM    = 'var(--color-cream)';
const MUTED    = 'var(--color-muted)';
const FAINT    = 'var(--color-faint)';
const ACCENT   = 'var(--accent)';
const ACCENT_DIM   = 'var(--accent-dim)';
const ACCENT_TINT  = 'var(--accent-tint)';
const ACCENT_TINT_25 = 'var(--accent-tint-25)';
const SURFACE_04 = 'var(--hairline)';
const SURFACE_08 = 'var(--hairline-strong)';
const RED      = 'var(--danger)';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fMono    = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody    = "'Inter', system-ui, sans-serif";
const MAX = '960px';

const useBreakpoint = () => {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 720 };
};

const Micro = ({ children, color = FAINT, style = {} }) => (
  <span style={{ fontFamily: fMono, fontSize: 10, fontWeight: 400, letterSpacing: '0.22em', textTransform: 'uppercase', color, ...style }}>
    {children}
  </span>
);

const CenterPane = ({ children }) => (
  <div style={{ minHeight: '100vh', background: INK, fontFamily: fBody, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
    {children}
  </div>
);

const SURCHARGE = 0.035;
const WHATSAPP = '51956787186';
const PICKUP_ADDRESS = 'Lince, Prolongación Iquitos 2515';

// Distritos con delivery gratis. Comparación se hace normalizando acentos.
const FREE_DELIVERY_DISTRICTS = ['lince', 'san isidro', 'miraflores', 'jesus maria'];
const _COMBINING = new RegExp('[\\u0300-\\u036f]', 'g');
const normDistrict = (s = '') => s.normalize('NFD').replace(_COMBINING, '').trim().toLowerCase();
const isFreeZone = (district) => FREE_DELIVERY_DISTRICTS.includes(normDistrict(district || ''));

const buildWhatsappMessage = (orden, lineas) => {
  const items = lineas.map(l =>
    `• ${l.product_name ?? `#${l.product_id}`} × ${l.product_qty} = S/ ${parseFloat(l.price_subtotal ?? l.price_unit * l.product_qty).toFixed(2)}`
  ).join('\n');
  const total = parseFloat(orden.amount_total ?? orden.total ?? 0).toFixed(2);
  const entrega = orden.delivery_type === 'pickup'
    ? `Recojo en tienda (${PICKUP_ADDRESS})`
    : 'Delivery (coordinemos costo si corresponde)';
  const comprobante = orden.invoice_type === 'factura'
    ? `Factura — RUC ${orden.ruc ?? ''} / ${orden.razon_social ?? ''}`
    : 'Boleta';
  return `Hola! Quiero pagar mi orden ${orden.name ?? `#${orden.id_salesorder ?? orden.id}`} por transferencia.\n\n${items}\n\nTotal: S/ ${total}\nEntrega: ${entrega}\nComprobante: ${comprobante}\n\n¿Me pasan los datos de cuenta? Gracias.`;
};

const StepIndicator = ({ current, isMobile }) => {
  const steps = ['Productos', 'Entrega', 'Comprobante', 'Pago'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, marginBottom: 32, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, border: `1px solid ${done || active ? ACCENT : HAIRLINE_STRONG}`, background: done ? ACCENT : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="square">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ fontFamily: fMono, fontSize: 11, fontWeight: 600, color: active ? ACCENT : FAINT }}>{i + 1}</span>
                )}
              </div>
              <span style={{ fontFamily: fBody, fontSize: 13, fontWeight: active ? 500 : 400, color: done || active ? CREAM : MUTED }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: isMobile ? 16 : 32, height: 1, background: done ? ACCENT : HAIRLINE_STRONG, flexShrink: 0 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const CartPage = () => {
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const { data: orden, isLoading: loading, isError } = useCurrentCart();
  const { updateLineById, deleteLineById, updateCartCount } = useCart();
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
  const [direccionObj, setDireccionObj] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(orden?.payment_method ?? 'transfer');
  const [deliveryType, setDeliveryType] = useState(orden?.delivery_type ?? 'delivery');
  const [invoiceType, setInvoiceType] = useState(orden?.invoice_type ?? 'boleta');
  const [ruc, setRuc] = useState(orden?.ruc ?? '');
  const [razonSocial, setRazonSocial] = useState(orden?.razon_social ?? '');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  const onDireccionPick = useCallback((id, obj) => {
    setDireccionSeleccionada(id);
    setDireccionObj(obj || null);
  }, []);

  // Sync campos del carrito con el backend al cargar.
  React.useEffect(() => {
    if (orden?.payment_method && orden.payment_method !== paymentMethod) setPaymentMethod(orden.payment_method);
    if (orden?.delivery_type && orden.delivery_type !== deliveryType) setDeliveryType(orden.delivery_type);
    if (orden?.invoice_type && orden.invoice_type !== invoiceType) setInvoiceType(orden.invoice_type);
    if (orden?.ruc != null && orden.ruc !== ruc) setRuc(orden.ruc || '');
    if (orden?.razon_social != null && orden.razon_social !== razonSocial) setRazonSocial(orden.razon_social || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden?.payment_method, orden?.delivery_type, orden?.invoice_type]);

  const actualizarCantidad = useCallback(async (lineId, newQty) => {
    try {
      if (newQty <= 0) await deleteLineById(lineId);
      else await updateLineById(lineId, { product_qty: newQty });
    } catch { /* silent */ }
  }, [updateLineById, deleteLineById]);

  const cambiarMetodoPago = useCallback(async (method) => {
    if (!orden || method === paymentMethod) return;
    setPaymentMethod(method);
    try {
      await client.put(`/sales-orders/${orden.id_salesorder}/`, { payment_method: method });
    } catch { /* refetch will resync */ }
  }, [orden, paymentMethod]);

  const cambiarTipoEntrega = useCallback(async (t) => {
    if (!orden || t === deliveryType) return;
    setDeliveryType(t);
    try {
      await client.put(`/sales-orders/${orden.id_salesorder}/`, { delivery_type: t });
    } catch { /* refetch will resync */ }
  }, [orden, deliveryType]);

  const confirmarOrden = useCallback(async () => {
    if (!orden || confirming) return;
    // Validaciones locales antes de pegarle al backend.
    if (deliveryType === 'delivery' && !direccionSeleccionada) {
      setError('Selecciona una dirección o cambia a recojo en tienda.');
      return;
    }
    if (invoiceType === 'factura' && (!ruc.trim() || !razonSocial.trim())) {
      setError('Para factura completa el RUC y la razón social.');
      return;
    }
    setConfirming(true);
    setError(null);
    try {
      const payload = {
        state: 'pending_payment',
        payment_method: paymentMethod,
        delivery_type: deliveryType,
        invoice_type: invoiceType,
        ruc: invoiceType === 'factura' ? ruc.trim() : null,
        razon_social: invoiceType === 'factura' ? razonSocial.trim() : null,
      };
      // address_id solo si es delivery; en pickup no aplica.
      if (deliveryType === 'delivery' && direccionSeleccionada) {
        payload.address_id = parseInt(direccionSeleccionada);
      }
      const updated = await client.put(`/sales-orders/${orden.id_salesorder}/`, payload);
      // La orden pasó a pending_payment: ya no es el carrito activo.
      updateCartCount();
      if (paymentMethod === 'transfer') {
        const msg = buildWhatsappMessage(updated.data, updated.data.salesorderline_set ?? []);
        window.open(
          `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
          '_blank',
          'noopener,noreferrer',
        );
      }
      // Tarjeta: el pago embebido vive en Mis Pedidos.
      navigate('/mis-pedidos');
    } catch (err) {
      // Backend responde 409 stock insuficiente, 400 datos inválidos.
      const detail = err?.response?.data?.detail || err?.response?.data?.error;
      setError(detail || 'Error al confirmar la orden. Intenta de nuevo.');
      setConfirming(false);
    }
  }, [orden, direccionSeleccionada, paymentMethod, deliveryType, invoiceType, ruc, razonSocial, navigate, confirming, updateCartCount]);

  const lineas = orden?.salesorderline_set ?? [];
  const baseSubtotal = lineas.reduce((s, l) => s + parseFloat(l.price_subtotal ?? l.price_unit * l.product_qty ?? 0), 0);
  const total = paymentMethod === 'card' ? +(baseSubtotal * (1 + SURCHARGE)).toFixed(2) : +baseSubtotal.toFixed(2);
  const surchargeAmount = paymentMethod === 'card' ? +(total - baseSubtotal).toFixed(2) : 0;

  // Estado del paso "Entrega": completo si pickup o si delivery con dirección.
  const stepDone2 = deliveryType === 'pickup' || (deliveryType === 'delivery' && !!direccionSeleccionada);
  const facturaOk = invoiceType === 'boleta' || (ruc.trim().length === 11 && razonSocial.trim().length > 0);
  const stepDone3 = stepDone2 && facturaOk;
  const currentStep = stepDone3 ? 3 : (stepDone2 ? 2 : (lineas.length > 0 ? 1 : 0));
  const canConfirm = stepDone2 && facturaOk && !confirming;

  if (loading) return <CenterPane><Micro>Cargando carrito…</Micro></CenterPane>;

  // Solo mostramos el fallback de error si falla el FETCH del carrito.
  // Errores al confirmar (stock, factura) se muestran inline sobre el CTA.
  if (isError) return (
    <CenterPane>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <Micro style={{ display: 'block', marginBottom: 14 }}>Error</Micro>
        <p style={{ fontFamily: fBody, fontSize: 15, color: CREAM, marginBottom: 28, lineHeight: 1.6 }}>Error al cargar el carrito</p>
        <button onClick={() => window.location.reload()} style={{ padding: '14px 28px', background: CREAM, color: INK, border: 'none', cursor: 'pointer', fontFamily: fBody, fontSize: 14, fontWeight: 600 }}>Reintentar</button>
      </div>
    </CenterPane>
  );

  if (!orden || lineas.length === 0) return (
    <CenterPane>
      <div style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, margin: '0 auto 24px', border: `1px solid ${HAIRLINE_STRONG}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: FAINT }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 7h14l-1.2 13.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7z"/>
            <path d="M9 7V5.5a3 3 0 0 1 6 0V7"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: fDisplay, fontWeight: 300, fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1.1, color: CREAM, margin: '0 0 14px' }}>
          Carrito <strong style={{ fontWeight: 600 }}>vacío.</strong>
        </h2>
        <p style={{ fontFamily: fBody, fontSize: 14, color: MUTED, marginBottom: 28, lineHeight: 1.6 }}>Aún no has agregado productos.</p>
        <a href="/catalogo" style={{ display: 'inline-block', padding: '14px 32px', background: ACCENT, color: INK, textDecoration: 'none', fontFamily: fBody, fontSize: 14, fontWeight: 600 }}>Ver catálogo →</a>
      </div>
    </CenterPane>
  );

  return (
    <div style={{ minHeight: '100vh', background: INK, fontFamily: fBody, paddingBottom: 120 }}>
      <div style={{ maxWidth: MAX, margin: '0 auto', padding: 'clamp(40px,5vw,72px) clamp(20px,5vw,40px) 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 28, height: 1, background: ACCENT_DIM }} />
          <Micro>{orden.name}</Micro>
        </div>
        <h1 style={{ fontFamily: fDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.05, color: CREAM, margin: '0 0 36px' }}>
          Tu <strong style={{ fontWeight: 600 }}>carrito.</strong>
        </h1>

        <StepIndicator current={currentStep} isMobile={isMobile} />

        {/* Items */}
        <section style={{ background: PANEL, border: `1px solid ${HAIRLINE}`, padding: isMobile ? '20px' : '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ width: 22, height: 22, background: ACCENT, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fMono, fontSize: 11, fontWeight: 600 }}>1</span>
            <h2 style={{ fontFamily: fBody, fontSize: 16, fontWeight: 600, color: CREAM, margin: 0, letterSpacing: '-0.01em' }}>Productos ({lineas.length})</h2>
          </div>

          {lineas.map((item, i) => (
            <div key={item.id_salesorderline} style={{ display: 'grid', gridTemplateColumns: isMobile ? '56px 1fr auto' : '56px 1fr 140px 120px 32px', gap: isMobile ? 12 : 16, padding: '18px 0', borderTop: i === 0 ? `1px solid ${HAIRLINE}` : 'none', borderBottom: `1px solid ${HAIRLINE}`, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, background: ELEV, border: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {item.product_img ? (
                  <img src={item.product_img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: fMono, fontSize: 9, color: FAINT }}>—</span>
                )}
              </div>
              <div>
                <div style={{ fontFamily: fBody, fontSize: 14, fontWeight: 500, color: CREAM, marginBottom: 4, lineHeight: 1.4 }}>
                  {item.product_name || `Producto #${item.product_id}`}
                </div>
                <div style={{ fontFamily: fMono, fontSize: 11, color: FAINT, letterSpacing: '0.04em' }}>
                  S/ {parseFloat(item.price_unit).toFixed(2)} / ud.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', gap: 8 }}>
                <button onClick={() => actualizarCantidad(item.id_salesorderline, item.product_qty - 1)} style={{ width: 32, height: 32, background: 'transparent', border: `1px solid ${HAIRLINE_STRONG}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = CREAM; }} onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE_STRONG; e.currentTarget.style.color = MUTED; }} aria-label="Restar"><Minus size={13} /></button>
                <span style={{ fontFamily: fDisplay, fontSize: 16, fontWeight: 500, color: CREAM, minWidth: 28, textAlign: 'center' }}>{item.product_qty}</span>
                <button onClick={() => actualizarCantidad(item.id_salesorderline, item.product_qty + 1)} style={{ width: 32, height: 32, background: 'transparent', border: `1px solid ${HAIRLINE_STRONG}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = CREAM; }} onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE_STRONG; e.currentTarget.style.color = MUTED; }} aria-label="Sumar"><Plus size={13} /></button>
              </div>

              <div style={{ textAlign: isMobile ? 'left' : 'right', fontFamily: fDisplay, fontSize: 17, fontWeight: 500, color: CREAM, letterSpacing: '-0.02em' }}>
                S/ {parseFloat(item.price_subtotal || item.price_unit * item.product_qty).toFixed(2)}
              </div>

              <button onClick={() => actualizarCantidad(item.id_salesorderline, 0)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: FAINT, display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-end' : 'center', padding: 0, transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = RED} onMouseLeave={e => e.currentTarget.style.color = FAINT} aria-label="Eliminar"><Trash2 size={15} /></button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 20 }}>
            <span style={{ fontFamily: fBody, fontSize: 14, fontWeight: 500, color: MUTED }}>Subtotal</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: fMono, fontSize: 13, color: FAINT, letterSpacing: '0.04em' }}>S/</span>
              <span style={{ fontFamily: fDisplay, fontSize: 30, fontWeight: 500, color: CREAM, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {baseSubtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Entrega: delivery vs pickup */}
        <section style={{ background: PANEL, border: `1px solid ${stepDone2 ? ACCENT_TINT_25 : HAIRLINE}`, padding: isMobile ? '20px' : '28px 32px', marginBottom: 24, transition: 'border-color 0.25s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 22, height: 22, background: stepDone2 ? ACCENT : (lineas.length ? CREAM : 'transparent'), color: INK, border: stepDone2 || lineas.length ? 'none' : `1px solid ${HAIRLINE_STRONG}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fMono, fontSize: 11, fontWeight: 600 }}>
              {stepDone2 ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="square"><polyline points="20 6 9 17 4 12" /></svg>
              ) : '2'}
            </span>
            <h2 style={{ fontFamily: fBody, fontSize: 16, fontWeight: 600, color: CREAM, margin: 0, letterSpacing: '-0.01em' }}>Entrega</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: deliveryType === 'delivery' ? 18 : 0 }}>
            {[
              { id: 'delivery', title: 'Delivery a domicilio', hint: 'Gratis en Lince, San Isidro, Miraflores y Jesús María.' },
              { id: 'pickup',   title: 'Recojo en tienda',     hint: `Gratis · ${PICKUP_ADDRESS}` },
            ].map(opt => {
              const active = deliveryType === opt.id;
              return (
                <button key={opt.id} type="button" onClick={() => cambiarTipoEntrega(opt.id)}
                  style={{ textAlign: 'left', cursor: 'pointer', background: active ? ACCENT_TINT : 'transparent', border: `1px solid ${active ? ACCENT : HAIRLINE_STRONG}`, padding: '14px 16px', fontFamily: fBody, transition: 'border-color 0.15s, background 0.15s' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: CREAM, marginBottom: 6 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{opt.hint}</div>
                </button>
              );
            })}
          </div>

          {deliveryType === 'delivery' && (
            <>
              <DireccionEnvio onDireccionSeleccionada={onDireccionPick} />
              {direccionObj?.ubigeo?.district && !isFreeZone(direccionObj.ubigeo.district) && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,191,71,0.06)', border: '1px solid rgba(255,191,71,0.35)', fontFamily: fBody, fontSize: 12, color: '#ffd28a', lineHeight: 1.5 }}>
                  Tu distrito (<strong>{direccionObj.ubigeo.district}</strong>) está fuera de la zona de delivery gratis. El costo se coordina por WhatsApp tras confirmar, o puedes elegir recojo gratis en {PICKUP_ADDRESS}.
                </div>
              )}
            </>
          )}

          {deliveryType === 'pickup' && (
            <div style={{ padding: '12px 14px', background: SURFACE_04, border: `1px solid ${HAIRLINE}`, fontFamily: fBody, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              Recoges en <strong style={{ color: CREAM }}>{PICKUP_ADDRESS}</strong>. Te avisamos por correo cuando esté listo.
            </div>
          )}
        </section>

        {/* Comprobante: boleta / factura */}
        <section style={{ background: PANEL, border: `1px solid ${HAIRLINE}`, padding: isMobile ? '20px' : '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 22, height: 22, background: ACCENT, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fMono, fontSize: 11, fontWeight: 600 }}>3</span>
            <h2 style={{ fontFamily: fBody, fontSize: 16, fontWeight: 600, color: CREAM, margin: 0, letterSpacing: '-0.01em' }}>Comprobante</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {[
              { id: 'boleta',  title: 'Boleta',  hint: 'Sin datos adicionales.' },
              { id: 'factura', title: 'Factura', hint: 'Requiere RUC y razón social.' },
            ].map(opt => {
              const active = invoiceType === opt.id;
              return (
                <button key={opt.id} type="button" onClick={() => setInvoiceType(opt.id)}
                  style={{ textAlign: 'left', cursor: 'pointer', background: active ? ACCENT_TINT : 'transparent', border: `1px solid ${active ? ACCENT : HAIRLINE_STRONG}`, padding: '14px 16px', fontFamily: fBody, transition: 'border-color 0.15s, background 0.15s' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: CREAM, marginBottom: 6 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{opt.hint}</div>
                </button>
              );
            })}
          </div>
          {invoiceType === 'factura' && (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '160px 1fr', gap: 12 }}>
              <input type="text" inputMode="numeric" maxLength={11} placeholder="RUC (11 dígitos)" value={ruc}
                onChange={e => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                style={{ padding: '12px 14px', background: 'transparent', border: `1px solid ${HAIRLINE_STRONG}`, color: CREAM, fontFamily: fBody, fontSize: 13 }} />
              <input type="text" placeholder="Razón social" value={razonSocial}
                onChange={e => setRazonSocial(e.target.value)}
                style={{ padding: '12px 14px', background: 'transparent', border: `1px solid ${HAIRLINE_STRONG}`, color: CREAM, fontFamily: fBody, fontSize: 13 }} />
            </div>
          )}
        </section>

        {/* Payment method */}
        <section style={{ background: PANEL, border: `1px solid ${HAIRLINE}`, padding: isMobile ? '20px' : '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 22, height: 22, background: ACCENT, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fMono, fontSize: 11, fontWeight: 600 }}>4</span>
            <h2 style={{ fontFamily: fBody, fontSize: 16, fontWeight: 600, color: CREAM, margin: 0, letterSpacing: '-0.01em' }}>Método de pago</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {[
              { id: 'transfer', title: 'Transferencia / Efectivo', hint: 'Sin recargo · Te coordinamos por WhatsApp', badge: 'Recomendado' },
              { id: 'card',     title: 'Tarjeta (Visa/Mastercard)', hint: '+3.5% recargo de pasarela · Pagas online en Mis Pedidos', badge: null },
            ].map(opt => {
              const active = paymentMethod === opt.id;
              return (
                <button key={opt.id} type="button" onClick={() => cambiarMetodoPago(opt.id)}
                  style={{
                    textAlign: 'left', cursor: 'pointer',
                    background: active ? ACCENT_TINT : 'transparent',
                    border: `1px solid ${active ? ACCENT : HAIRLINE_STRONG}`,
                    padding: '14px 16px', transition: 'border-color 0.15s, background 0.15s',
                    fontFamily: fBody,
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: CREAM }}>{opt.title}</span>
                    {opt.badge && <Micro color={ACCENT}>{opt.badge}</Micro>}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{opt.hint}</div>
                </button>
              );
            })}
          </div>

          {paymentMethod === 'card' && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'space-between', fontFamily: fBody, fontSize: 13 }}>
              <span style={{ color: MUTED }}>Recargo de pasarela (3.5%)</span>
              <span style={{ color: CREAM }}>+ S/ {surchargeAmount.toFixed(2)}</span>
            </div>
          )}
        </section>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'var(--nav-bg-scrolled)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${HAIRLINE_STRONG}`, padding: '16px 20px' }}>
        {error && (
          <div style={{ maxWidth: MAX, margin: '0 auto 12px', padding: '10px 14px', background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.35)', fontFamily: fBody, fontSize: 13, color: '#ff8080' }}>{error}</div>
        )}
        <div style={{ maxWidth: MAX, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Micro style={{ display: 'block', marginBottom: 4 }}>
              {paymentMethod === 'card' ? 'Total con tarjeta' : 'Total a pagar'}
            </Micro>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: fMono, fontSize: 12, color: FAINT }}>S/</span>
              <span style={{ fontFamily: fDisplay, fontSize: 26, fontWeight: 500, color: CREAM, letterSpacing: '-0.025em', lineHeight: 1 }}>
                {total.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={confirmarOrden}
            disabled={!canConfirm}
            style={{
              padding: '16px 28px',
              background: !canConfirm ? SURFACE_08 : (confirming ? CREAM : ACCENT),
              color: !canConfirm ? FAINT : INK,
              border: 'none',
              cursor: !canConfirm ? 'not-allowed' : 'pointer',
              fontFamily: fBody, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em',
              transition: 'background 0.2s',
              minWidth: isMobile ? 0 : 240, flex: isMobile ? 1 : '0 0 auto',
            }}>
            {confirming ? 'Confirmando…'
              : !stepDone2 ? (deliveryType === 'delivery' ? '↓ Selecciona dirección' : '↓ Completa los pasos')
              : !facturaOk ? '↓ Completa datos de factura'
              : paymentMethod === 'transfer' ? 'Confirmar pedido →'
              : 'Confirmar y pagar con tarjeta →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
