import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Minus, Plus, ChevronLeft, ChevronRight, Lock, ZoomIn, Star as StarIcon } from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart';
import { ProductRecommendations } from './ProductRecommendations';
import { INVOICING_ENABLED } from '../../../shared/lib/features';

/* ── Design tokens ───────────────────────────────────────────── */
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
const WHITE    = '#FFFFFF';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fMono    = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody    = "'Inter', system-ui, sans-serif";

const useBreakpoint = () => {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 820 };
};

const Micro = ({ children, color = FAINT, style = {} }) => (
  <span style={{
    fontFamily: fMono, fontSize: 10, fontWeight: 400,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color, whiteSpace: 'nowrap', ...style,
  }}>
    {children}
  </span>
);

const STAR = '#FFB547';

/* ── Rating helpers ──────────────────────────────────────────── */
// `score` llega en distintas escalas según el origen (0-5, 0-10, 0-100).
// Normalizamos a 0-5 de forma defensiva.
const toFive = (score) => {
  const s = parseFloat(score);
  if (!Number.isFinite(s)) return null;
  if (s <= 5) return s;
  if (s <= 10) return s / 2;
  return s / 20;
};

/* ── Estrellas estilo Amazon (soporta medias) ────────────────── */
const Stars = ({ score, size = 13 }) => {
  const value = toFive(score);
  if (value == null) return null;
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }} aria-label={`${clamped.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, clamped - i));
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', width: size, height: size, lineHeight: 0 }}>
            <StarIcon size={size} style={{ fill: 'rgba(245,245,240,0.18)', color: 'rgba(245,245,240,0.18)' }} />
            {fill > 0 && (
              <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${fill * 100}%` }}>
                <StarIcon size={size} style={{ fill: STAR, color: STAR }} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

/* ── Estado de stock (escasez / urgencia) ────────────────────── */
const getStockState = (product) => {
  const stock = parseInt(product?.stock ?? 0, 10);
  if (!Number.isFinite(stock) || stock <= 0) return { state: 'out', label: 'Agotado' };
  if (stock <= 2) return { state: 'low', label: `Quedan ${stock} unidad${stock > 1 ? 'es' : ''}` };
  return { state: 'in', label: 'En stock' };
};

const StockStatus = ({ product }) => {
  const { state, label } = getStockState(product);
  const dot = state === 'in' ? '#4ADE80' : state === 'low' ? STAR : RED;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <Micro color={state === 'out' ? FAINT : MUTED}>{label}</Micro>
    </div>
  );
};

/* ── Cart button (estado-aware) ──────────────────────────────── */
export const CartButton = ({ product, cartHook }) => {
  const [showLogin, setShowLogin] = useState(false);
  const { updateCartCount } = useCart();

  const { isInCart, quantity } = useMemo(() => {
    if (!cartHook?.cartData?.salesorderline_set) return { isInCart: false, quantity: 0 };
    const line = cartHook.cartData.salesorderline_set.find(l => l.product === product.id_product && !l.pull);
    return { isInCart: !!line, quantity: line ? parseInt(line.product_qty) || 0 : 0 };
  }, [cartHook?.cartData, product.id_product]);

  const act = async action => {
    try {
      if (!cartHook?.updateCartQuantity) return;
      const price = product.price_offer || product.price;
      if (action === 'toggle')   await cartHook.updateCartQuantity(product.id_product, isInCart ? 0 : 1, price);
      if (action === 'increase') await cartHook.updateCartQuantity(product.id_product, quantity + 1, price);
      if (action === 'decrease') await cartHook.updateCartQuantity(product.id_product, quantity - 1, price);
      updateCartCount();
    } catch { setShowLogin(true); }
  };

  if (showLogin) return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: PANEL, border: `1px solid ${HAIRLINE_STRONG}`,
        padding: 32, maxWidth: 400, width: '100%',
      }}>
        <Micro style={{ display: 'block', marginBottom: 12 }}>Acceso requerido</Micro>
        <h3 style={{
          fontFamily: fDisplay, fontWeight: 300, fontSize: 26,
          letterSpacing: '-0.025em', color: CREAM, margin: '0 0 10px',
        }}>
          Inicia <strong style={{ fontWeight: 600 }}>sesión.</strong>
        </h3>
        <p style={{ fontFamily: fBody, fontSize: 14, color: MUTED, marginBottom: 24, lineHeight: 1.6 }}>
          Para agregar productos al carrito necesitas tener una cuenta.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.location.href = '/login'}
            style={{
              flex: 1, padding: '14px 0', background: ACCENT, color: INK,
              border: 'none', cursor: 'pointer',
              fontFamily: fBody, fontSize: 14, fontWeight: 600,
            }}>
            Iniciar sesión
          </button>
          <button onClick={() => setShowLogin(false)}
            style={{
              flex: 1, padding: '14px 0', background: 'transparent', color: MUTED,
              border: `1px solid ${HAIRLINE_STRONG}`, cursor: 'pointer',
              fontFamily: fBody, fontSize: 14, fontWeight: 500,
            }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  if (!isInCart) return (
    <button onClick={() => act('toggle')} disabled={cartHook?.loading}
      style={{
        width: '100%', padding: '16px 0',
        background: ACCENT, color: INK, border: 'none',
        cursor: cartHook?.loading ? 'wait' : 'pointer',
        fontFamily: fBody, fontSize: 15, fontWeight: 700,
        letterSpacing: '-0.005em',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {cartHook?.loading ? 'Cargando…' : 'Agregar al carrito'}
    </button>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1px solid ${ACCENT}`, height: 52, background: 'var(--accent-tint)',
    }}>
      <button onClick={() => act('decrease')} disabled={cartHook?.loading}
        style={{
          width: 52, height: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: CREAM,
          borderRight: `1px solid ${HAIRLINE_STRONG}`,
        }}>
        <Minus size={16} />
      </button>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{
          fontFamily: fDisplay, fontSize: 18, fontWeight: 600, color: CREAM, lineHeight: 1,
        }}>{quantity}</div>
        <div style={{ fontFamily: fMono, fontSize: 9, color: ACCENT, letterSpacing: '0.16em', marginTop: 2 }}>
          EN CARRITO
        </div>
      </div>
      <button onClick={() => act('increase')} disabled={cartHook?.loading}
        style={{
          width: 52, height: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: CREAM,
          borderLeft: `1px solid ${HAIRLINE_STRONG}`,
        }}>
        <Plus size={16} />
      </button>
    </div>
  );
};

/* ── WhatsApp button ─────────────────────────────────────────── */
export const WhatsAppButton = ({ product }) => {
  const price = product.price_offer || product.price;
  const msg = `Hola, me interesa este producto:\n\n*${product.name}*\nPrecio: S/${price}\n\n¿Podrías darme más información?`;
  const [hov, setHov] = useState(false);
  return (
    <a
      href={`https://wa.me/51956787186?text=${encodeURIComponent(msg)}`}
      target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'block', width: '100%', padding: '14px 0',
        background: 'transparent', color: hov ? CREAM : MUTED,
        border: `1px solid ${hov ? HAIRLINE_STRONG : HAIRLINE}`,
        textAlign: 'center', textDecoration: 'none',
        fontFamily: fBody, fontSize: 14, fontWeight: 500,
        boxSizing: 'border-box',
        transition: 'all 0.2s',
      }}>
      Consultar por WhatsApp
    </a>
  );
};

export const ProductActions = ({ product, cartHook, onViewDetail }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
    <button onClick={() => onViewDetail(product)}
      style={{
        padding: '10px 16px', background: 'none', cursor: 'pointer',
        border: `1px solid ${HAIRLINE_STRONG}`,
        fontFamily: fBody, fontSize: 13, fontWeight: 500, color: MUTED,
      }}>
      Ver detalle
    </button>
    <CartButton product={product} cartHook={cartHook} />
    <WhatsAppButton product={product} />
  </div>
);

/* ── Image Carousel ───────────────────────────────────────────── */
export const ImageCarousel = ({ images, productName }) => {
  const { isMobile } = useBreakpoint();
  const [current, setCurrent] = useState(0);
  const [fade, setFade]       = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom]       = useState(false);
  const [origin, setOrigin]   = useState({ x: 50, y: 50 });
  const touchX = useRef(null);
  const touchY = useRef(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, current]);

  if (!images || images.length === 0) return null;

  const goTo = (idx) => {
    if (idx === current) return;
    setFade(true);
    setZoom(false);
    setTimeout(() => { setCurrent(idx); setFade(false); }, 160);
  };

  const prev = () => goTo((current - 1 + images.length) % images.length);
  const next = () => goTo((current + 1) % images.length);
  const imgSrc = images[current]?.image || images[current];
  const btnSize = isMobile ? 44 : 36;

  // Swipe desactivado: en mobile el gesto se reserva 100% para pinch-zoom cómodo.
  // La navegación entre fotos queda por flechas y miniaturas.
  const onMove = (e) => {
    if (isMobile || !zoom) return;
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };
  const toggleZoom = (e) => {
    if (isMobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
    setZoom(z => !z);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minWidth: 0, background: PANEL }}>

        {/* Main image */}
        <div
          onClick={toggleZoom}
          onMouseMove={onMove}
          style={{
            flex: 1, position: 'relative', background: WHITE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: isMobile ? 280 : 320, overflow: 'hidden',
            cursor: isMobile ? 'default' : (zoom ? 'move' : 'zoom-in'),
            touchAction: 'manipulation',
          }}>
          <img
            src={imgSrc}
            alt={productName}
            draggable={false}
            style={{
              maxWidth: '82%', maxHeight: '82%',
              width: 'auto', height: 'auto',
              objectFit: 'contain',
              opacity: fade ? 0 : 1,
              transform: zoom && !isMobile ? 'scale(1.8)' : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
              transition: fade
                ? 'opacity 0.16s ease'
                : 'opacity 0.16s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
              userSelect: 'none',
              willChange: 'transform',
            }}
          />

          {/* Zoom button */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
            aria-label="Ampliar imagen"
            style={{
              position: 'absolute', top: 8, right: 8,
              width: btnSize, height: btnSize,
              background: 'rgba(10,10,11,0.55)', backdropFilter: 'blur(6px)',
              border: `1px solid ${HAIRLINE_STRONG}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: CREAM, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,10,11,0.88)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,10,11,0.55)'}
          >
            <ZoomIn size={isMobile ? 18 : 15} />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Anterior" style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                width: btnSize, height: btnSize,
                background: 'rgba(10,10,11,0.55)', backdropFilter: 'blur(4px)',
                border: `1px solid ${HAIRLINE_STRONG}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: CREAM, zIndex: 2, transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,10,11,0.88)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,10,11,0.55)'}
              >
                <ChevronLeft size={isMobile ? 20 : 17} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Siguiente" style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: btnSize, height: btnSize,
                background: 'rgba(10,10,11,0.55)', backdropFilter: 'blur(4px)',
                border: `1px solid ${HAIRLINE_STRONG}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: CREAM, zIndex: 2, transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,10,11,0.88)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,10,11,0.55)'}
              >
                <ChevronRight size={isMobile ? 20 : 17} />
              </button>

              {/* Dots */}
              <div style={{
                position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 6,
              }}>
                {images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); goTo(i); }} aria-label={`Imagen ${i + 1}`}
                    style={{
                      width: i === current ? 20 : 6,
                      height: isMobile ? 8 : 6,
                      background: i === current ? ACCENT : 'rgba(10,10,11,0.35)',
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails — ocultos en mobile para no duplicar la navegación */}
        {images.length > 1 && !isMobile && (
          <div style={{
            display: 'flex', gap: 6, padding: '8px 10px',
            overflowX: 'auto', background: INK,
            borderTop: `1px solid ${HAIRLINE}`,
          }}>
            {images.map((img, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  flexShrink: 0, width: 60, height: 48,
                  background: WHITE,
                  border: `2px solid ${i === current ? ACCENT : 'transparent'}`,
                  outline: i !== current ? `1px solid ${HAIRLINE}` : 'none',
                  cursor: 'pointer', padding: 3, overflow: 'hidden',
                  transition: 'border-color 0.2s, opacity 0.2s',
                  opacity: i === current ? 1 : 0.6,
                }}
                onMouseEnter={e => { if (i !== current) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { if (i !== current) e.currentTarget.style.opacity = '0.6'; }}
              >
                <img src={img?.image || img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </button>
            ))}
          </div>
        )}

        {/* Thumbnail strip en mobile — más grande y fácil de tocar */}
        {images.length > 1 && isMobile && (
          <div style={{
            display: 'flex', gap: 8, padding: '10px 12px',
            overflowX: 'auto', background: INK,
            borderTop: `1px solid ${HAIRLINE}`,
            WebkitOverflowScrolling: 'touch',
          }}>
            {images.map((img, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  flexShrink: 0, width: 68, height: 56,
                  background: WHITE,
                  border: `2px solid ${i === current ? ACCENT : 'transparent'}`,
                  outline: i !== current ? `1px solid ${HAIRLINE}` : 'none',
                  cursor: 'pointer', padding: 4, overflow: 'hidden',
                  transition: 'border-color 0.2s, opacity 0.2s',
                  opacity: i === current ? 1 : 0.55,
                }}
              >
                <img src={img?.image || img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: isMobile ? 'none' : 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src={imgSrc}
            alt={productName}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: isMobile ? '100vw' : '92vw',
              maxHeight: isMobile ? '80vh' : '88vh',
              objectFit: 'contain',
              userSelect: 'none',
              touchAction: 'manipulation',
            }}
          />

          {/* Close */}
          <button onClick={() => setLightbox(false)}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: isMobile ? 48 : 38, height: isMobile ? 48 : 38,
              background: 'rgba(245,245,240,0.12)',
              border: `1px solid rgba(245,245,240,0.18)`,
              cursor: 'pointer', color: CREAM,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? 24 : 20, lineHeight: 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,245,240,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,245,240,0.12)'}
          >
            ×
          </button>

          {/* Nav en lightbox */}
          {images.length > 1 && (
            <>
              <Micro style={{ position: 'absolute', bottom: isMobile ? 16 : 20, color: 'rgba(245,245,240,0.3)' }}>
                {current + 1} / {images.length}
              </Micro>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: 'absolute', left: isMobile ? 8 : 16,
                  top: '50%', transform: 'translateY(-50%)',
                  width: isMobile ? 48 : 44, height: isMobile ? 48 : 44,
                  background: 'rgba(245,245,240,0.08)',
                  border: `1px solid rgba(245,245,240,0.12)`,
                  cursor: 'pointer', color: CREAM,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,245,240,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,245,240,0.08)'}
              >
                <ChevronLeft size={isMobile ? 22 : 20} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: 'absolute', right: isMobile ? 8 : 16,
                  top: '50%', transform: 'translateY(-50%)',
                  width: isMobile ? 48 : 44, height: isMobile ? 48 : 44,
                  background: 'rgba(245,245,240,0.08)',
                  border: `1px solid rgba(245,245,240,0.12)`,
                  cursor: 'pointer', color: CREAM,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,245,240,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,245,240,0.08)'}
              >
                <ChevronRight size={isMobile ? 22 : 20} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

/* ── ProductDetail ───────────────────────────────────────────── */
export const ProductDetail = ({ product, onBack, cartHook }) => {
  const { isMobile } = useBreakpoint();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  // Empuja el botón flotante de WhatsApp por encima de la barra fija de
  // "Agregar al carrito" (mobile) para que no se tapen entre sí.
  useEffect(() => {
    if (!isMobile) return undefined;
    document.documentElement.style.setProperty('--sticky-cta-offset', '76px');
    return () => document.documentElement.style.removeProperty('--sticky-cta-offset');
  }, [isMobile]);

  if (!product) return (
    <div style={{
      minHeight: '100vh', background: INK, fontFamily: fBody,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <Micro style={{ display: 'block', marginBottom: 16 }}>Producto no encontrado</Micro>
        <button onClick={onBack}
          style={{
            fontFamily: fBody, fontSize: 14, fontWeight: 500, color: CREAM,
            background: 'none', border: `1px solid ${HAIRLINE_STRONG}`,
            padding: '14px 28px', cursor: 'pointer',
          }}>
          ← Volver al catálogo
        </button>
      </div>
    </div>
  );

  const imgs = product.images?.length > 0
    ? [...product.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : product.main_image ? [{ image: product.main_image }] : [];
  // price_offer = oferta efectivo/transferencia (headline). price = PVPR (tachado).
  // Con tarjeta se aplica +3.5% (recargo de pasarela) que se muestra como hint.
  const price = parseFloat(product.price_offer || product.price);
  const originalPrice = product.price_offer ? parseFloat(product.price) : null;
  const savingsPct = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;
  const cardPrice = product.price_offer ? +(price * 1.035).toFixed(2) : null;
  const stockState = getStockState(product);
  const ratingValue = toFive(product.score);

  const specs = [
    { label: 'Marca',     value: product.brand },
    { label: 'Facción',   value: product.faction },
    { label: 'Era',       value: product.era },
    { label: 'Planeta',   value: product.planet_origin },
    { label: 'Personaje', value: product.character_related },
    { label: 'Material',  value: product.material },
    { label: 'Modelo',    value: product.model },
    { label: 'Edición',   value: product.is_collectible ? 'Coleccionable' : null },
    { label: 'Condición', value: product.condition || 'Nuevo' },
  ].filter(s => s.value);

  return (
    <div style={{ minHeight: '100vh', background: INK, fontFamily: fBody, overflowX: 'hidden' }}>

      {/* Nav */}
      <div style={{
        padding: '16px clamp(20px, 4vw, 40px)',
        borderBottom: `1px solid ${HAIRLINE}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        overflow: 'hidden',
      }}>
        <button onClick={onBack}
          style={{
            fontFamily: fBody, fontSize: 13, fontWeight: 500,
            color: MUTED, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: 0, flexShrink: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = CREAM}
          onMouseLeave={e => e.currentTarget.style.color = MUTED}>
          ← Catálogo
        </button>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <Micro style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Armalo · {product.brand}
          </Micro>
        </div>
      </div>

      {/* Main split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '55% 45%',
        minHeight: isMobile ? 'auto' : 'calc(100vh - 57px)',
        maxWidth: '100%',
      }}>

        {/* LEFT — Images */}
        <div style={{
          position: isMobile ? 'static' : 'sticky',
          top: 0,
          height: isMobile ? 'auto' : '100vh',
          minHeight: isMobile ? 320 : 'auto',
          minWidth: 0, overflow: 'hidden',
          borderRight: isMobile ? 'none' : `1px solid ${HAIRLINE}`,
          borderBottom: isMobile ? `1px solid ${HAIRLINE}` : 'none',
        }}>
          {imgs.length > 0
            ? <ImageCarousel images={imgs} productName={product.name} />
            : (
              <div style={{
                height: '100%', minHeight: 320, background: WHITE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Micro color="rgba(10,10,11,0.4)">Sin imagen disponible</Micro>
              </div>
            )
          }
        </div>

        {/* RIGHT — Info panel */}
        <div style={{
          padding: 'clamp(32px,4vw,64px) clamp(20px,4vw,52px)',
          display: 'flex', flexDirection: 'column', gap: 28,
          minWidth: 0,
        }}>

          {/* Brand + name */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 24, height: 1, background: 'var(--accent-dim)' }} />
              <Micro color={ACCENT}>{product.brand}</Micro>
            </div>
            <h1 style={{
              fontFamily: fDisplay, fontWeight: 300,
              fontSize: 'clamp(26px, 3.5vw, 42px)', lineHeight: 1.1,
              letterSpacing: '-0.025em', color: CREAM,
              margin: '0 0 8px',
            }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 12, minHeight: 20 }}>
              {ratingValue != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stars score={product.score} />
                  <span style={{ fontFamily: fMono, fontSize: 10, color: MUTED, letterSpacing: '0.04em' }}>
                    {ratingValue.toFixed(1)}
                  </span>
                </div>
              )}
              {product.is_collectible && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 8px',
                  background: 'var(--accent-tint)', color: ACCENT,
                  border: '1px solid var(--accent-tint)',
                  fontFamily: fBody, fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  lineHeight: 1.2, whiteSpace: 'nowrap',
                }}>
                  Edición Coleccionable
                </span>
              )}
            </div>
            {product.condition && (
              <Micro>{product.condition}</Micro>
            )}
          </div>

          {/* Price */}
          <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 24 }}>
            <Micro style={{ display: 'block', marginBottom: 12 }}>Precio</Micro>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              {savingsPct > 0 && (
                <span style={{
                  fontFamily: fBody, fontSize: 18, fontWeight: 600,
                  color: RED, letterSpacing: '-0.01em', lineHeight: 1,
                }}>
                  -{savingsPct}%
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: fMono, fontSize: 14, color: MUTED, letterSpacing: '0.06em' }}>S/</span>
                <span style={{
                  fontFamily: fDisplay, fontSize: 'clamp(36px,4vw,52px)', fontWeight: 500,
                  color: CREAM, letterSpacing: '-0.035em', lineHeight: 1,
                }}>
                  {price.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            {originalPrice && (
              <div style={{
                marginTop: 8,
                fontFamily: fBody, fontSize: 13, color: FAINT,
              }}>
                PVPR: <span style={{ textDecoration: 'line-through' }}>
                  S/{originalPrice.toLocaleString('es-PE')}
                </span>
              </div>
            )}

            {cardPrice && (
              <div style={{
                marginTop: 12,
                fontFamily: fBody, fontSize: 12, color: MUTED,
              }}>
                Con tarjeta: <span style={{ color: CREAM }}>S/ {cardPrice.toLocaleString('es-PE')}</span>
                <span style={{ color: FAINT }}> (+3.5% pasarela)</span>
              </div>
            )}
          </div>

          {/* Stock + CTAs */}
          <StockStatus product={product} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stockState.state === 'out' ? (
              <button
                disabled
                style={{
                  width: '100%', padding: '16px 0',
                  background: 'var(--hairline)', color: FAINT, border: 'none',
                  cursor: 'not-allowed',
                  fontFamily: fBody, fontSize: 15, fontWeight: 700,
                  letterSpacing: '-0.005em',
                }}
              >
                Agotado
              </button>
            ) : (
              <CartButton product={product} cartHook={cartHook} />
            )}
            <WhatsAppButton product={product} />
          </div>

          {/* Trust strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
            background: PANEL, border: `1px solid ${HAIRLINE}`,
          }}>
            {[
              { n: '100% Original',  d: 'Verificado' },
              // Comprobantes: se muestra solo si podemos emitir (shared/lib/features).
              ...(INVOICING_ENABLED ? [{ n: 'Boleta / Factura', d: 'En 24h' }] : []),
            ].map(({ n, d }, i) => (
              <div key={n} style={{
                padding: '16px',
                borderLeft: i % 2 ? `1px solid ${HAIRLINE}` : 'none',
                borderTop: i >= 2 ? `1px solid ${HAIRLINE}` : 'none',
              }}>
                <div style={{ fontFamily: fBody, fontSize: 13, fontWeight: 500, color: CREAM }}>{n}</div>
                <div style={{ fontFamily: fMono, fontSize: 10, color: FAINT, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4 }}>
                  {d}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: FAINT,
          }}>
            <Lock size={11} />
            <Micro>Pago seguro · Coordinamos por WhatsApp</Micro>
          </div>

          {/* Specs */}
          <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 28 }}>
            <Micro style={{ display: 'block', marginBottom: 20 }}>Especificaciones técnicas</Micro>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'max-content 1fr',
              columnGap: 24, rowGap: isMobile ? 16 : 14,
            }}>
              {specs.map(({ label, value }) => (
                <React.Fragment key={label}>
                  <dt style={{
                    fontFamily: fMono, fontSize: 10, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: FAINT,
                    fontStyle: 'normal',
                  }}>{label}</dt>
                  <dd style={{
                    fontFamily: fBody, fontSize: 14, color: CREAM,
                    margin: 0,
                    paddingBottom: isMobile ? 12 : 0,
                    borderBottom: isMobile ? `1px solid ${HAIRLINE}` : 'none',
                  }}>{value}</dd>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 28, paddingBottom: 32 }}>
              <Micro style={{ display: 'block', marginBottom: 16 }}>Descripción</Micro>
              <p style={{
                fontFamily: fBody, fontSize: 14, color: MUTED,
                lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0,
              }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Spacer para no tapar contenido con la barra fija en mobile */}
          {isMobile && <div style={{ height: 80 }} />}
        </div>
      </div>

      {/* Recomendaciones estilo eBay — full-width al final */}
      <ProductRecommendations currentProduct={product} />

      {/* Sticky CTA bar — solo mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900,
          background: 'var(--nav-bg-scrolled)', backdropFilter: 'saturate(180%) blur(20px)',
          borderTop: `1px solid ${HAIRLINE_STRONG}`,
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{
              fontFamily: fMono, fontSize: 9, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: FAINT, marginBottom: 2,
            }}>
              Precio
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontFamily: fMono, fontSize: 11, color: MUTED }}>S/</span>
              <span style={{
                fontFamily: fDisplay, fontSize: 22, fontWeight: 600,
                color: CREAM, letterSpacing: '-0.025em', lineHeight: 1,
              }}>
                {price.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {stockState.state === 'out' ? (
              <div style={{
                width: '100%', padding: '16px 0',
                background: 'var(--hairline)', color: FAINT,
                textAlign: 'center',
                fontFamily: fBody, fontSize: 15, fontWeight: 700,
              }}>
                Agotado
              </div>
            ) : (
              <CartButton product={product} cartHook={cartHook} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
