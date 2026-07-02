import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DireccionEnvio from './DireccionEnvio';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCurrentCart, useCart } from '../features/cart/hooks/useCart';
import client from '../shared/api/client';

/* ── Design tokens ───────────────────────────────────────────── */
const INK      = '#0A0A0B';
const PANEL    = '#0F0F12';
const HAIRLINE = 'rgba(245,245,240,0.07)';
const HAIRLINE_STRONG = 'rgba(245,245,240,0.14)';
const CREAM    = '#F5F5F0';
const MUTED    = 'rgba(245,245,240,0.55)';
const FAINT    = 'rgba(245,245,240,0.32)';
const ACCENT   = '#A3FF7C';
const RED      = '#FF4D4D';

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
  <span style={{
    fontFamily: fMono, fontSize: 10, fontWeight: 400,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color, ...style,
  }}>
    {children}
  </span>
);

const CenterPane = ({ children }) => (
  <div style={{
    minHeight: '100vh', background: INK, fontFamily: fBody,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px',
  }}>
    {children}
  </div>
);

const StepIndicator = ({ current, isMobile }) => {
  const steps = ['Productos', 'Dirección', 'Confirmar'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14,
      marginBottom: 32, flexWrap: isMobile ? 'wrap' : 'nowrap',
    }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 22, height: 22,
                border: `1px solid ${done || active ? ACCENT : HAIRLINE_STRONG}`,
                background: done ? ACCENT : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="square">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{
                    fontFamily: fMono, fontSize: 11, fontWeight: 600,
                    color: active ? ACCENT : FAINT,
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span style={{
                fontFamily: fBody, fontSize: 13, fontWeight: active ? 500 : 400,
                color: done || active ? CREAM : MUTED,
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: isMobile ? 16 : 32, height: 1,
                background: done ? ACCENT : HAIRLINE_STRONG, flexShrink: 0,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const CarritoCompra = () => {
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const { data: orden, isLoading: loading, isError } = useCurrentCart();
  const { updateLineById, deleteLineById } = useCart();
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  const actualizarCantidad = useCallback(async (lineId, newQty) => {
    try {
      if (newQty <= 0) await deleteLineById(lineId);
      else await updateLineById(lineId, { product_qty: newQty });
    } catch { /* silent — query will stay stale */ }
  }, [updateLineById, deleteLineById]);

  const confirmarOrden = useCallback(async () => {
    if (!orden || !direccionSeleccionada || confirming) return;
    setConfirming(true);
    try {
      await client.put(`/sales-orders/${orden.id_salesorder}/`, {
        state: 'pending_payment',
        address_id: parseInt(direccionSeleccionada),
      });
      navigate('/mis-pedidos');
    } catch {
      setError('Error al confirmar la orden. Intenta de nuevo.');
      setConfirming(false);
    }
  }, [orden, direccionSeleccionada, navigate, confirming]);

  const lineas = orden?.salesorderline_set ?? [];
  const currentStep = direccionSeleccionada ? 2 : (lineas.length > 0 ? 1 : 0);

  if (loading) return (
    <CenterPane><Micro>Cargando carrito…</Micro></CenterPane>
  );

  if (isError || error) return (
    <CenterPane>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <Micro style={{ display: 'block', marginBottom: 14 }}>Error</Micro>
        <p style={{ fontFamily: fBody, fontSize: 15, color: CREAM, marginBottom: 28, lineHeight: 1.6 }}>
          {error || 'Error al cargar el carrito'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '14px 28px', background: CREAM, color: INK, border: 'none',
            cursor: 'pointer', fontFamily: fBody, fontSize: 14, fontWeight: 600,
          }}
        >
          Reintentar
        </button>
      </div>
    </CenterPane>
  );

  if (!orden || lineas.length === 0) return (
    <CenterPane>
      <div style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, margin: '0 auto 24px',
          border: `1px solid ${HAIRLINE_STRONG}`, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: FAINT,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 7h14l-1.2 13.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7z"/>
            <path d="M9 7V5.5a3 3 0 0 1 6 0V7"/>
          </svg>
        </div>
        <h2 style={{
          fontFamily: fDisplay, fontWeight: 300,
          fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1.1,
          color: CREAM, margin: '0 0 14px',
        }}>
          Carrito <strong style={{ fontWeight: 600 }}>vacío.</strong>
        </h2>
        <p style={{ fontFamily: fBody, fontSize: 14, color: MUTED, marginBottom: 28, lineHeight: 1.6 }}>
          Aún no has agregado productos.
        </p>
        <a
          href="/catalogo"
          style={{
            display: 'inline-block', padding: '14px 32px',
            background: ACCENT, color: INK,
            textDecoration: 'none', fontFamily: fBody,
            fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em',
          }}
        >
          Ver catálogo →
        </a>
      </div>
    </CenterPane>
  );

  return (
    <div style={{
      minHeight: '100vh', background: INK, fontFamily: fBody,
      paddingBottom: 120,
    }}>
      <div style={{ maxWidth: MAX, margin: '0 auto', padding: 'clamp(40px,5vw,72px) clamp(20px,5vw,40px) 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 28, height: 1, background: 'rgba(163,255,124,0.65)' }} />
          <Micro>{orden.name}</Micro>
        </div>
        <h1 style={{
          fontFamily: fDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.035em',
          lineHeight: 1.05, color: CREAM, margin: '0 0 36px',
        }}>
          Tu <strong style={{ fontWeight: 600 }}>carrito.</strong>
        </h1>

        <StepIndicator current={currentStep} isMobile={isMobile} />

        {/* ── Items ── */}
        <section style={{
          background: PANEL, border: `1px solid ${HAIRLINE}`,
          padding: isMobile ? '20px' : '28px 32px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{
              width: 22, height: 22,
              background: ACCENT, color: INK,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fMono, fontSize: 11, fontWeight: 600,
            }}>1</span>
            <h2 style={{
              fontFamily: fBody, fontSize: 16, fontWeight: 600,
              color: CREAM, margin: 0, letterSpacing: '-0.01em',
            }}>
              Productos ({lineas.length})
            </h2>
          </div>

          {lineas.map((item, i) => (
            <div key={item.id_salesorderline} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr auto' : '1fr 140px 120px 32px',
              gap: isMobile ? 12 : 16,
              padding: '18px 0',
              borderTop: i === 0 ? `1px solid ${HAIRLINE}` : 'none',
              borderBottom: `1px solid ${HAIRLINE}`,
              alignItems: 'center',
            }}>
              <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                <div style={{
                  fontFamily: fBody, fontSize: 14, fontWeight: 500,
                  color: CREAM, marginBottom: 4, lineHeight: 1.4,
                }}>
                  {item.product_name || `Producto #${item.product_id}`}
                </div>
                <div style={{ fontFamily: fMono, fontSize: 11, color: FAINT, letterSpacing: '0.04em' }}>
                  S/ {parseFloat(item.price_unit).toFixed(2)} / ud.
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: isMobile ? 'flex-start' : 'center', gap: 8,
              }}>
                <button
                  onClick={() => actualizarCantidad(item.id_salesorderline, item.product_qty - 1)}
                  style={{
                    width: 32, height: 32,
                    background: 'transparent', border: `1px solid ${HAIRLINE_STRONG}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: MUTED, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = CREAM; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE_STRONG; e.currentTarget.style.color = MUTED; }}
                  aria-label="Restar"
                >
                  <Minus size={13} />
                </button>
                <span style={{
                  fontFamily: fDisplay, fontSize: 16, fontWeight: 500,
                  color: CREAM, minWidth: 28, textAlign: 'center',
                }}>
                  {item.product_qty}
                </span>
                <button
                  onClick={() => actualizarCantidad(item.id_salesorderline, item.product_qty + 1)}
                  style={{
                    width: 32, height: 32,
                    background: 'transparent', border: `1px solid ${HAIRLINE_STRONG}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: MUTED, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = CREAM; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE_STRONG; e.currentTarget.style.color = MUTED; }}
                  aria-label="Sumar"
                >
                  <Plus size={13} />
                </button>
              </div>

              <div style={{
                textAlign: isMobile ? 'left' : 'right',
                fontFamily: fDisplay, fontSize: 17, fontWeight: 500,
                color: CREAM, letterSpacing: '-0.02em',
              }}>
                S/ {parseFloat(item.price_subtotal || item.price_unit * item.product_qty).toFixed(2)}
              </div>

              <button
                onClick={() => actualizarCantidad(item.id_salesorderline, 0)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: FAINT, display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-end' : 'center',
                  padding: 0, transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = RED}
                onMouseLeave={e => e.currentTarget.style.color = FAINT}
                aria-label="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingTop: 20,
          }}>
            <span style={{ fontFamily: fBody, fontSize: 14, fontWeight: 500, color: MUTED }}>
              Subtotal
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: fMono, fontSize: 13, color: FAINT, letterSpacing: '0.04em' }}>S/</span>
              <span style={{
                fontFamily: fDisplay, fontSize: 30, fontWeight: 500,
                color: CREAM, letterSpacing: '-0.03em', lineHeight: 1,
              }}>
                {parseFloat(orden.amount_total ?? orden.total ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* ── Address ── */}
        <section style={{
          background: PANEL,
          border: `1px solid ${direccionSeleccionada ? 'rgba(163,255,124,0.25)' : HAIRLINE}`,
          padding: isMobile ? '20px' : '28px 32px',
          marginBottom: 24,
          transition: 'border-color 0.25s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{
              width: 22, height: 22,
              background: direccionSeleccionada ? ACCENT : (lineas.length ? CREAM : 'transparent'),
              color: INK,
              border: direccionSeleccionada || lineas.length ? 'none' : `1px solid ${HAIRLINE_STRONG}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fMono, fontSize: 11, fontWeight: 600,
            }}>
              {direccionSeleccionada ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="square">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : '2'}
            </span>
            <h2 style={{
              fontFamily: fBody, fontSize: 16, fontWeight: 600,
              color: CREAM, margin: 0, letterSpacing: '-0.01em',
            }}>
              Dirección de envío
            </h2>
          </div>

          <DireccionEnvio onDireccionSeleccionada={setDireccionSeleccionada} />
        </section>
      </div>

      {/* ── Sticky CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,10,11,0.96)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${HAIRLINE_STRONG}`,
        padding: '16px 20px',
      }}>
        <div style={{
          maxWidth: MAX, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <Micro style={{ display: 'block', marginBottom: 4 }}>
              {direccionSeleccionada ? 'Listo para confirmar' : 'Total'}
            </Micro>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: fMono, fontSize: 12, color: FAINT }}>S/</span>
              <span style={{
                fontFamily: fDisplay, fontSize: 26, fontWeight: 500,
                color: CREAM, letterSpacing: '-0.025em', lineHeight: 1,
              }}>
                {parseFloat(orden.amount_total ?? orden.total ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={confirmarOrden}
            disabled={!direccionSeleccionada || confirming}
            style={{
              padding: '16px 28px',
              background: !direccionSeleccionada ? 'rgba(245,245,240,0.08)' : (confirming ? CREAM : ACCENT),
              color: !direccionSeleccionada ? FAINT : INK,
              border: 'none',
              cursor: !direccionSeleccionada || confirming ? 'not-allowed' : 'pointer',
              fontFamily: fBody, fontSize: 15, fontWeight: 600,
              letterSpacing: '-0.005em',
              transition: 'background 0.2s',
              minWidth: isMobile ? 0 : 220,
              flex: isMobile ? 1 : '0 0 auto',
            }}
          >
            {confirming
              ? 'Confirmando…'
              : !direccionSeleccionada
                ? '↓ Selecciona dirección'
                : 'Confirmar orden →'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarritoCompra;
