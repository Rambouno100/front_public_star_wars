import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

const INK      = 'var(--bg-ink)';
const PANEL    = 'var(--bg-panel)';
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

const Micro = ({ children, color = FAINT, style = {} }) => (
  <span style={{
    fontFamily: fMono, fontSize: 10, fontWeight: 400,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color, whiteSpace: 'nowrap', ...style,
  }}>
    {children}
  </span>
);

/* ── Scoring helpers ─────────────────────────────────────────── */

const tokenize = (s) =>
  String(s ?? '')
    .toLowerCase()
    .split(/[\s\-,/().]+/)
    .filter(t => t.length >= 3);

// Jaccard de tokens significativos (≥3 chars). Mide afinidad de specs sin
// requerir match exacto: "Intel Core i7-13620H" vs "Intel Core Ultra 7" comparten "intel" y "core".
const jaccard = (a, b) => {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
};

const isFlash = (p) => p?.approved === true || p?.approved === 'true';

const getPurpose = (p) => {
  for (const v of [p?.category, p?.type, p?.purpose]) {
    const lower = String(v ?? '').toLowerCase();
    if (lower === 'gamer' || lower === 'office') return lower;
  }
  return '';
};

const num = (v, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Score híbrido cliente + negocio.
 *
 * RELEVANCIA (lo que le conviene al cliente, peso 0.60):
 *   - Mismo purpose:        0.25  (un gamer no quiere ver office y viceversa)
 *   - Misma marca:          0.08  (suave; útil pero no determinante)
 *   - Proximidad de precio: 0.22  (banda ±50% del precio actual)
 *   - Match CPU:            0.13
 *   - Match GPU:            0.10  (más alto si es gamer)
 *   - Match RAM/Storage:    0.07
 *
 * NEGOCIO (lo que nos conviene a nosotros, peso 0.40):
 *   - Margin ratio:         0.45  (margin / market price)
 *   - Flash Offer:          0.35  (boost binario — son los curados)
 *   - Score interno:        0.20  (sello de calidad del catálogo)
 *
 * Resultado final ∈ [0, 1]. Empates se rompen por score interno DESC.
 */
const computeScore = (current, candidate) => {
  const curPurpose  = getPurpose(current);
  const candPurpose = getPurpose(candidate);

  // Relevancia
  const samePurpose = curPurpose && candPurpose === curPurpose ? 1 : 0;
  const sameBrand = current.brand && candidate.brand &&
    String(current.brand).toLowerCase() === String(candidate.brand).toLowerCase() ? 1 : 0;

  const curPrice  = num(current.price_offer ?? current.price);
  const candPrice = num(candidate.price_offer ?? candidate.price);
  const priceProximity = curPrice > 0
    ? Math.max(0, 1 - Math.min(1, Math.abs(candPrice - curPrice) / curPrice))
    : 0;

  const factionMatch    = jaccard(current.faction, candidate.faction);
  const eraMatch        = jaccard(current.era, candidate.era);
  const characterMatch  = jaccard(current.character_related, candidate.character_related);

  const relevance =
    samePurpose      * 0.25 +
    sameBrand        * 0.08 +
    priceProximity   * 0.22 +
    factionMatch     * 0.13 +
    eraMatch         * 0.10 +
    characterMatch   * 0.07;

  // Negocio
  const candMarket = num(candidate.price);
  const candOffer  = num(candidate.price_offer ?? candidate.price);
  const marginRatio = candMarket > 0
    ? Math.max(0, Math.min(1, (candMarket - candOffer) / candMarket))
    : 0;
  const flashBoost = isFlash(candidate) ? 1 : 0;
  const scoreNorm = Math.min(1, num(candidate.score) / 10);

  const business =
    marginRatio * 0.45 +
    flashBoost  * 0.35 +
    scoreNorm   * 0.20;

  return relevance * 0.60 + business * 0.40;
};

/* ── Compact recommendation card ─────────────────────────────── */
// Mismo lenguaje visual que ProductCard en LaptopAdvisorCatalog:
// brand → title → badge (si aplica) → price/discount. El badge va en el cuerpo,
// nunca encima de la imagen (no tapa el producto).

const FlashBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '4px 9px',
    background: RED, color: WHITE,
    border: 'none',
    fontFamily: fBody, fontSize: 10, fontWeight: 600,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    lineHeight: 1.2, whiteSpace: 'nowrap',
  }}>
    Oferta Relámpago
  </span>
);

const RecCard = ({ product, onClick }) => {
  const [hovered, setHovered] = useState(false);
  // eslint-disable-next-line no-console
  console.log('[REC]', product.name?.slice(0, 40), { main_image: product.main_image, imgs_count: product.images?.length, imgs_orders: product.images?.map(i => ({ order: i.order, url: i.url?.slice(-30) })) });
  const price = num(product.price_offer ?? product.price);
  const market = product.price_offer ? num(product.price) : null;
  const discount = market && market > price ? Math.round((1 - price / market) * 100) : 0;
  const flash = isFlash(product);

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '0 0 220px',
        scrollSnapAlign: 'start',
        background: PANEL,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        border: `1px solid ${hovered ? HAIRLINE_STRONG : HAIRLINE}`,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? '0 12px 28px -10px rgba(0,0,0,0.55)' : 'none',
      }}
    >
      {/* Image */}
      <div style={{
        background: WHITE, aspectRatio: '4/3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src={
            product.images?.length > 0
              ? [...product.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0].image
              : (product.main_image ?? product.img ?? '')
          }
          alt={product.name}
          style={{
            maxWidth: '82%', maxHeight: '82%',
            objectFit: 'contain',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Body */}
      <div style={{
        padding: '14px 14px 16px',
        display: 'flex', flexDirection: 'column',
        flex: 1, minWidth: 0,
      }}>
        {/* Brand — altura fija para alinear cards entre sí */}
        <div style={{ minHeight: 12, marginBottom: 6 }}>
          {product.brand && (
            <Micro style={{ letterSpacing: '0.18em', opacity: 0.75 }}>{product.brand}</Micro>
          )}
        </div>

        {/* Title — 2 líneas fijas */}
        <h4 style={{
          fontFamily: fBody, fontSize: 13, fontWeight: 500,
          color: CREAM, lineHeight: 1.35, letterSpacing: '-0.005em',
          margin: '0 0 10px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: 36,
        }}>
          {product.name}
        </h4>

        {/* Badge — reserva altura aunque no exista, para alineación entre cards */}
        <div style={{ minHeight: 22, marginBottom: 10 }}>
          {flash && <FlashBadge />}
        </div>

        {/* Price + discount — anclado al fondo */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          marginTop: 'auto',
        }}>
          {discount > 0 && (
            <span style={{
              fontFamily: fBody, fontSize: 12, fontWeight: 600,
              color: RED, letterSpacing: '-0.01em', lineHeight: 1,
            }}>
              -{discount}%
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontFamily: fBody, fontSize: 10, color: MUTED, fontWeight: 500 }}>S/</span>
            <span style={{
              fontFamily: fDisplay, fontSize: 19, fontWeight: 500,
              color: CREAM, letterSpacing: '-0.025em', lineHeight: 1,
            }}>
              {price.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* PVPR tachado — sutil, debajo */}
        {market && (
          <div style={{
            marginTop: 4,
            fontFamily: fBody, fontSize: 10.5, color: FAINT, lineHeight: 1.4,
          }}>
            PVPR: <span style={{ textDecoration: 'line-through' }}>
              S/{market.toLocaleString('es-PE')}
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

/* ── Section ─────────────────────────────────────────────────── */

export const ProductRecommendations = ({ currentProduct }) => {
  const navigate = useNavigate();
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const purpose = getPurpose(currentProduct);

  // Pedimos un pool amplio (idealmente del mismo purpose para que el ranking del
  // back ya nos dé candidatos relevantes). Si no hay purpose, fetch general.
  const { data } = useProducts({
    limit: 100,
    purpose: purpose || null,
  });

  const pool = useMemo(
    () => data?.pages?.flatMap(p => p.items) ?? [],
    [data],
  );

  const recs = useMemo(() => {
    if (!currentProduct) return [];
    const currentId = currentProduct.id_product ?? currentProduct.id;
    const candidates = pool.filter(p => {
      if (!p) return false;
      const pid = p.id_product ?? p.id;
      if (pid === currentId) return false;
      if (p.is_active === false) return false;
      if ((p.stock ?? 1) <= 0) return false;
      return true;
    });
    return candidates
      .map(c => ({ p: c, s: computeScore(currentProduct, c) }))
      .sort((a, b) => b.s - a.s || num(b.p.score) - num(a.p.score))
      .slice(0, 8)
      .map(({ p }) => p);
  }, [pool, currentProduct]);

  // Track scroll edges para mostrar/ocultar flechas
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, [recs.length]);

  const scrollBy = (delta) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (recs.length === 0) return null;

  return (
    <section style={{
      background: INK,
      borderTop: `1px solid ${HAIRLINE}`,
      padding: 'clamp(40px,5vw,72px) clamp(20px,4vw,52px)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 16, marginBottom: 28,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 24, height: 1, background: 'var(--accent-dim)' }} />
              <Micro color={ACCENT}>Recomendado para ti</Micro>
            </div>
            <h2 style={{
              fontFamily: fDisplay, fontWeight: 300,
              fontSize: 'clamp(22px, 2.6vw, 32px)',
              letterSpacing: '-0.025em', color: CREAM,
              margin: 0, lineHeight: 1.15,
            }}>
              También podrían <strong style={{ fontWeight: 600 }}>interesarte.</strong>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => scrollBy(-480)}
              disabled={!canScrollLeft}
              aria-label="Desplazar a la izquierda"
              style={{
                width: 40, height: 40,
                background: 'transparent',
                border: `1px solid ${HAIRLINE_STRONG}`,
                color: canScrollLeft ? CREAM : FAINT,
                cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollBy(480)}
              disabled={!canScrollRight}
              aria-label="Desplazar a la derecha"
              style={{
                width: 40, height: 40,
                background: 'transparent',
                border: `1px solid ${HAIRLINE_STRONG}`,
                color: canScrollRight ? CREAM : FAINT,
                cursor: canScrollRight ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          style={{
            display: 'flex', gap: 14,
            overflowX: 'auto', scrollSnapType: 'x mandatory',
            paddingBottom: 8, marginBottom: -8,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {recs.map(p => (
            <RecCard
              key={p.id_product ?? p.id}
              product={p}
              onClick={() => { navigate(`/product/${p.id_product ?? p.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendations;
