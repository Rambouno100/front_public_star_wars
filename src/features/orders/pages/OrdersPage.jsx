import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentContext } from '../../payment/context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrders } from '../api';
import { useMe } from '../../auth/hooks/useAuth';
import KRGlue from '@lyracom/embedded-form-glue';
import client from '../../../shared/api/client';
import { Lock, ShieldCheck, CreditCard, MessageCircle, X } from 'lucide-react';

const WHATSAPP = '51956787186';
const buildWaMessage = (order, lines) => {
  const items = lines.map(l =>
    `• ${l.product_name ?? `#${l.product_id}`} × ${l.product_qty} = S/ ${parseFloat(l.price_subtotal ?? l.price_unit * l.product_qty).toFixed(2)}`
  ).join('\n');
  const total = parseFloat(order.amount_total ?? order.total ?? 0).toFixed(2);
  return `Hola! Quiero pagar mi orden ${order.name ?? `#${order.id_salesorder ?? order.id}`} por transferencia.\n\n${items}\n\nTotal: S/ ${total}\n\n¿Me pasan los datos de cuenta? Gracias.`;
};

/* ── Design tokens (temáticos — ver src/index.css) ─────────────── */
const INK      = 'var(--bg-ink)';
const PANEL    = 'var(--bg-panel)';
const CARBON   = 'var(--bg-elev)';
const HAIRLINE = 'var(--hairline)';
const HAIRLINE_STRONG = 'var(--hairline-strong)';
const CREAM    = 'var(--color-cream)';
const MUTED    = 'var(--color-muted)';
const FAINT    = 'var(--color-faint)';
const ACCENT   = 'var(--accent)';
const RED      = 'var(--danger)';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fMono    = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody    = "'Inter', system-ui, sans-serif";
const MAX = '1100px';

const useBreakpoint = () => {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 720, isTablet: w < 980 };
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

const STATE_LABEL = { draft: 'Borrador', pending_payment: 'Pendiente', paid: 'Pagado', cancelled: 'Cancelado', sale: 'Confirmado', done: 'Completado', cancel: 'Cancelado' };
const STATE_COLOR = { paid: ACCENT, done: ACCENT, sale: CREAM, pending_payment: MUTED, draft: FAINT, cancelled: RED, cancel: RED };

const OrdersPage = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { publicKey, endPoint, getFormToken, validatePayment } = usePaymentContext();
  const { data: me } = useMe();

  const [page, setPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [payingOrder, setPayingOrder] = useState(null);
  const [payingAddress, setPayingAddress] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  const handleCancelOrder = useCallback(async (orderId) => {
    if (cancellingId) return;
    if (!window.confirm('¿Seguro que quieres cancelar este pedido?')) return;
    setCancellingId(orderId);
    setCancelError(null);
    try {
      await client.post(`/sales-orders/${orderId}/cancel/`);
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      setCancelError(err?.response?.data?.detail || 'No se pudo cancelar el pedido.');
    } finally {
      setCancellingId(null);
    }
  }, [cancellingId, queryClient]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => getOrders({ page }),
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const pedidos = (data?.results ?? data?.items ?? (Array.isArray(data) ? data : [])).filter(p => p.state !== 'draft');
  const totalPages = data?.count ? Math.ceil(data.count / 10) : 0;

  const formatDate = d => {
    const date = new Date(d);
    return isNaN(date) ? '—' : date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const toggleOrder = id => setExpandedOrders(p => ({ ...p, [id]: !p[id] }));

  const handlePayOrder = useCallback(async (order) => {
    try {
      setPaymentError(null);
      setPayingAddress(null);
      setPayingOrder(order);
      if (order.address_id) {
        try {
          const { data: addr } = await client.get(`/direcciones/${order.address_id}/`);
          setPayingAddress(addr);
        } catch {}
      }
      const lines = (order.salesorderline_set ?? order.lines ?? []).map(l => ({
        salesorderline_id: l.id_salesorderline ?? l.id,
        amount: parseFloat(l.price_subtotal),
      }));
      const amount = parseFloat(order.amount_total);
      const token = await getFormToken({ amount, orderLines: lines, orderId: order.id_salesorder ?? order.id });
      const { KR } = await KRGlue.loadLibrary(endPoint, publicKey);
      await KR.setFormConfig({ formToken: token, 'kr-language': 'es-ES' });
      await KR.onSubmit(async (paymentData) => {
        try {
          const isPaid = await validatePayment(paymentData);
          if (isPaid?.paid) {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            navigate(`/order-confirmation?orders=${order.id_salesorder ?? order.id}&amount=${amount.toFixed(2)}`);
          } else {
            setPaymentError('El pago no se completó. Verifica los datos y vuelve a intentar.');
          }
        } catch { setPaymentError('Error al procesar el pago. Intenta de nuevo.'); }
      });
      await KR.renderElements('#paymentForm');
      await KR.showForm(token);
    } catch (err) {
      setPaymentError('Error al iniciar el pago: ' + (err?.response?.data?.error || err?.message || 'desconocido'));
      setPayingOrder(null);
    }
  }, [getFormToken, validatePayment, endPoint, publicKey, navigate, queryClient]);

  if (isLoading) return <CenterPane><Micro>Cargando pedidos…</Micro></CenterPane>;

  if (error) return (
    <CenterPane>
      <div style={{ textAlign: 'center' }}>
        <Micro style={{ display: 'block', marginBottom: 14 }}>Error</Micro>
        <p style={{ fontFamily: fBody, fontSize: 14, color: MUTED, marginBottom: 24 }}>Error al cargar los pedidos</p>
        <button onClick={() => refetch()} style={{ padding: '14px 28px', background: CREAM, color: INK, border: 'none', cursor: 'pointer', fontFamily: fBody, fontSize: 14, fontWeight: 600 }}>Reintentar</button>
      </div>
    </CenterPane>
  );

  if (!pedidos.length) return (
    <CenterPane>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <Micro style={{ display: 'block', marginBottom: 14 }}>Sin pedidos</Micro>
        <h2 style={{ fontFamily: fDisplay, fontWeight: 300, fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1.1, color: CREAM, margin: '0 0 14px' }}>
          Sin <strong style={{ fontWeight: 600 }}>pedidos.</strong>
        </h2>
        <p style={{ fontFamily: fBody, fontSize: 14, color: MUTED, lineHeight: 1.65, marginBottom: 28 }}>Aún no tienes pedidos confirmados.</p>
        <a href="/catalogo" style={{ display: 'inline-block', padding: '14px 32px', background: ACCENT, color: INK, textDecoration: 'none', fontFamily: fBody, fontSize: 14, fontWeight: 600 }}>Ver catálogo →</a>
      </div>
    </CenterPane>
  );

  return (
    <div style={{ minHeight: '100vh', background: INK, fontFamily: fBody, paddingBottom: 60 }}>
      <div style={{ maxWidth: MAX, margin: '0 auto', padding: 'clamp(40px,5vw,72px) clamp(20px,5vw,40px)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 28, height: 1, background: 'var(--accent-dim)' }} />
          <Micro>Armalo · Pedidos</Micro>
        </div>
        <h1 style={{ fontFamily: fDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.05, color: CREAM, margin: '0 0 36px' }}>
          Mis <strong style={{ fontWeight: 600 }}>pedidos.</strong>
        </h1>

        {cancelError && (
          <div style={{ padding: '12px 14px', marginBottom: 16, background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.35)', fontFamily: fBody, fontSize: 13, color: '#ff8080' }}>{cancelError}</div>
        )}

        {pedidos.map(pedido => {
          const orderId = pedido.id_salesorder ?? pedido.id;
          const isOpen = expandedOrders[orderId];
          const state = pedido.state;
          const stateLabel = STATE_LABEL[state] ?? state;
          const stateColor = STATE_COLOR[state] ?? MUTED;
          const lines = pedido.salesorderline_set ?? pedido.lines ?? [];
          const isPending = state === 'pending_payment' || state === 'sale';
          const isTransfer = (pedido.payment_method ?? 'transfer') === 'transfer';

          return (
            <div key={orderId} style={{ background: PANEL, border: `1px solid ${HAIRLINE}`, marginBottom: 14 }}>
              <div onClick={() => toggleOrder(orderId)} style={{ padding: isMobile ? '16px' : '20px 24px', cursor: 'pointer', display: 'grid', gridTemplateColumns: isMobile ? '1fr auto' : '1fr 120px 140px auto', gap: isMobile ? 12 : 16, alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: fBody, fontSize: 14, fontWeight: 600, color: CREAM }}>{pedido.name ?? `#${orderId}`}</span>
                  <div style={{ fontFamily: fBody, fontSize: 12, color: FAINT, marginTop: 4 }}>
                    {lines.length} ítem{lines.length !== 1 ? 's' : ''}{isMobile ? ` · ${formatDate(pedido.date_order)}` : ''}
                  </div>
                </div>
                {!isMobile && <div style={{ fontFamily: fBody, fontSize: 13, color: MUTED }}>{formatDate(pedido.date_order)}</div>}
                {!isMobile && <span style={{ fontFamily: fMono, fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: stateColor }}>{stateLabel}</span>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                  <span style={{ fontFamily: fDisplay, fontSize: 18, fontWeight: 500, color: CREAM, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                    S/ {parseFloat(pedido.amount_total).toFixed(2)}
                  </span>
                  {isPending && (
                    isTransfer ? (
                      <a
                        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildWaMessage(pedido, lines))}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ padding: '8px 16px', background: ACCENT, color: INK, textDecoration: 'none', cursor: 'pointer', fontFamily: fBody, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MessageCircle size={11} strokeWidth={2.5} />Coordinar pago
                      </a>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); handlePayOrder(pedido); }} style={{ padding: '8px 16px', background: ACCENT, color: INK, border: 'none', cursor: 'pointer', fontFamily: fBody, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lock size={11} strokeWidth={2.5} />Pagar tarjeta
                      </button>
                    )
                  )}
                  {isPending && (
                    <button onClick={e => { e.stopPropagation(); handleCancelOrder(orderId); }}
                      disabled={cancellingId === orderId}
                      title="Cancelar pedido"
                      style={{ padding: '8px 10px', background: 'transparent', color: FAINT, border: `1px solid ${HAIRLINE_STRONG}`, cursor: cancellingId === orderId ? 'not-allowed' : 'pointer', fontFamily: fBody, fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
                      onMouseEnter={e => { if (cancellingId !== orderId) { e.currentTarget.style.color = RED; e.currentTarget.style.borderColor = RED; } }}
                      onMouseLeave={e => { e.currentTarget.style.color = FAINT; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}>
                      <X size={11} strokeWidth={2.5} />{cancellingId === orderId ? '…' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>

              {isOpen && lines.length > 0 && (
                <div style={{ borderTop: `1px solid ${HAIRLINE}`, background: CARBON }}>
                  {lines.map((item, i) => (
                    <div key={item.id_salesorderline ?? item.id ?? i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '44px 1fr auto' : '44px 1fr 60px 120px', gap: 14, padding: isMobile ? '12px 16px' : '12px 24px', borderBottom: i < lines.length - 1 ? `1px solid ${HAIRLINE}` : 'none', alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, background: CARBON, border: `1px solid ${HAIRLINE}`, overflow: 'hidden' }}>
                        {item.product_img && (
                          <img src={item.product_img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontFamily: fBody, fontSize: 13, color: CREAM, lineHeight: 1.4 }}>{item.product_name ?? item.name}</div>
                        {isMobile && <div style={{ fontFamily: fMono, fontSize: 11, color: MUTED, marginTop: 2 }}>×{parseInt(item.product_qty ?? item.quantity ?? 1)}</div>}
                      </div>
                      {!isMobile && <div style={{ fontFamily: fMono, fontSize: 12, color: MUTED, textAlign: 'center' }}>×{parseInt(item.product_qty ?? item.quantity ?? 1)}</div>}
                      <div style={{ fontFamily: fDisplay, fontSize: 14, fontWeight: 500, color: CREAM, textAlign: 'right' }}>S/ {parseFloat(item.price_subtotal ?? item.subtotal ?? 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 36 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, background: p === page ? CREAM : 'transparent', color: p === page ? INK : MUTED, border: `1px solid ${p === page ? CREAM : HAIRLINE}`, cursor: 'pointer', fontFamily: fBody, fontSize: 13, fontWeight: 500 }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Payment modal */}
      {payingOrder && (() => {
        const lines = payingOrder.salesorderline_set ?? payingOrder.lines ?? [];
        const total = parseFloat(payingOrder.amount_total ?? payingOrder.total ?? 0);
        const sinIgv = total / 1.18;
        const igv = total - sinIgv;
        const addrLine = payingAddress
          ? [payingAddress.direccion, payingAddress.ubigeo?.district, payingAddress.ubigeo?.province].filter(Boolean).join(', ')
          : null;

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
            <div style={{ background: 'var(--bg-panel)', border: `1px solid ${HAIRLINE_STRONG}`, width: '100%', maxWidth: isMobile ? 480 : 860, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: isMobile ? 'auto' : 560 }}>

              {/* Resumen */}
              <div style={{ padding: isMobile ? '28px 24px' : '36px 36px', borderRight: isMobile ? 'none' : `1px solid ${HAIRLINE_STRONG}`, borderBottom: isMobile ? `1px solid ${HAIRLINE_STRONG}` : 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 28 }}>
                  <Micro style={{ display: 'block', marginBottom: 10 }}>{payingOrder.name ?? `Orden #${payingOrder.id_salesorder ?? payingOrder.id}`}</Micro>
                  <h2 style={{ fontFamily: fDisplay, fontWeight: 300, fontSize: 28, letterSpacing: '-0.03em', color: CREAM, margin: 0, lineHeight: 1.1 }}>
                    Resumen de <strong style={{ fontWeight: 600 }}>tu pedido.</strong>
                  </h2>
                </div>
                <div style={{ flex: 1 }}>
                  {lines.map((item, i) => {
                    const sub = parseFloat(item.price_subtotal ?? item.price_unit * item.product_qty ?? 0);
                    return (
                      <div key={item.id_salesorderline ?? item.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '12px 0', borderBottom: `1px solid ${HAIRLINE}` }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: fBody, fontSize: 13, color: CREAM, lineHeight: 1.45, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.product_name ?? `Producto #${item.product_id}`}
                          </div>
                          <span style={{ display: 'inline-block', fontFamily: fMono, fontSize: 10, color: '#0A0A0B', background: FAINT, padding: '2px 7px' }}>×{item.product_qty}</span>
                        </div>
                        <div style={{ fontFamily: fDisplay, fontSize: 15, fontWeight: 500, color: CREAM, flexShrink: 0, letterSpacing: '-0.01em' }}>S/ {sub.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${HAIRLINE_STRONG}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: fBody, fontSize: 12, color: MUTED }}>Subtotal s/IGV</span>
                    <span style={{ fontFamily: fBody, fontSize: 12, color: MUTED }}>S/ {sinIgv.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontFamily: fBody, fontSize: 12, color: MUTED }}>IGV 18%</span>
                    <span style={{ fontFamily: fBody, fontSize: 12, color: MUTED }}>S/ {igv.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: fBody, fontSize: 15, fontWeight: 600, color: CREAM }}>Total</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: fMono, fontSize: 11, color: FAINT, marginRight: 4 }}>PEN</span>
                      <span style={{ fontFamily: fDisplay, fontSize: 36, fontWeight: 700, color: CREAM, letterSpacing: '-0.04em', lineHeight: 1 }}>{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {(me?.email || addrLine) && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${HAIRLINE}` }}>
                    <Micro style={{ display: 'block', marginBottom: 12 }}>Datos de envío</Micro>
                    {me?.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><div style={{ width: 6, height: 6, background: HAIRLINE_STRONG, flexShrink: 0 }} /><span style={{ fontFamily: fBody, fontSize: 13, color: MUTED }}>{me.email}</span></div>}
                    {addrLine && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><div style={{ width: 6, height: 6, background: HAIRLINE_STRONG, flexShrink: 0, marginTop: 5 }} /><span style={{ fontFamily: fBody, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{addrLine}</span></div>}
                  </div>
                )}
              </div>

              {/* Pago */}
              <div style={{ padding: isMobile ? '28px 24px' : '36px 36px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Lock size={12} color={ACCENT} strokeWidth={2.5} />
                      <Micro color={ACCENT}>Pago seguro</Micro>
                    </div>
                    <h3 style={{ fontFamily: fDisplay, fontWeight: 300, fontSize: 22, letterSpacing: '-0.025em', color: CREAM, margin: 0, lineHeight: 1.1 }}>
                      Datos de <strong style={{ fontWeight: 600 }}>tu tarjeta.</strong>
                    </h3>
                  </div>
                  <button onClick={() => { setPayingOrder(null); setPayingAddress(null); setPaymentError(null); }} style={{ background: 'transparent', border: `1px solid ${HAIRLINE_STRONG}`, cursor: 'pointer', color: MUTED, width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fBody, fontSize: 16, lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <CreditCard size={13} color={FAINT} strokeWidth={1.5} />
                  <span style={{ fontFamily: fBody, fontSize: 11, color: FAINT }}>Visa · Mastercard · Amex · Diners</span>
                </div>
                {paymentError && (
                  <div style={{ padding: '12px 14px', marginBottom: 16, background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.35)', fontFamily: fBody, fontSize: 13, color: '#ff8080' }}>{paymentError}</div>
                )}
                <div style={{ flex: 1 }}>
                  <div id="paymentForm" style={{ background: '#fff', padding: 16, minHeight: 260 }}>
                    <div className="kr-embedded" />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={13} color={FAINT} strokeWidth={1.5} />
                  <span style={{ fontFamily: fBody, fontSize: 11, color: FAINT, lineHeight: 1.5 }}>
                    Transacción cifrada SSL · Procesado por Izipay · Tus datos de tarjeta no se almacenan en nuestros servidores.
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OrdersPage;
