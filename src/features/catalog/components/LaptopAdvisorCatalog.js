import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';

/* ── Design tokens ───────────────────────────────────────────── */
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

/* ── Breakpoint hook ─────────────────────────────────────────── */
const useBreakpoint = () => {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 720, isTablet: w < 960 };
};

/* ── Micro label ─────────────────────────────────────────────── */
const Micro = ({ children, color = FAINT, style = {} }) => (
  <span style={{
    fontFamily: fMono, fontSize: 10, fontWeight: 400,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color, whiteSpace: 'nowrap', ...style,
  }}>
    {children}
  </span>
);

/* ── Tag inline (relleno acento / rojo) ──────────────────────── */
const Tag = ({ label, variant = 'cool' }) => {
  const styles = {
    flash:   { bg: RED,                            text: WHITE,  border: 'none' },
    cool:    { bg: 'var(--accent-tint)',       text: ACCENT, border: '1px solid var(--accent-tint)' },
    neutral: { bg: 'rgba(245,245,240,0.05)',       text: MUTED,  border: `1px solid ${HAIRLINE_STRONG}` },
  };
  const s = styles[variant] || styles.cool;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 9px',
      background: s.bg, color: s.text, border: s.border,
      fontFamily: fBody, fontSize: 10, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
};

/* ── Filter row ──────────────────────────────────────────────── */
const FilterRow = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '14px 0', background: 'none', border: 'none',
      borderBottom: `1px solid ${active ? HAIRLINE_STRONG : HAIRLINE}`,
      cursor: 'pointer', textAlign: 'left',
      transition: 'border-color 0.25s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.borderBottomColor = HAIRLINE_STRONG; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.borderBottomColor = HAIRLINE; }}
  >
    <span style={{
      fontFamily: fBody, fontSize: 13, letterSpacing: '-0.005em',
      fontWeight: active ? 500 : 400,
      color: active ? CREAM : MUTED,
      transition: 'color 0.25s',
    }}>
      {label}
    </span>
    <span style={{
      fontFamily: fMono, fontSize: 10, letterSpacing: '0.06em',
      color: active ? ACCENT : FAINT,
      transition: 'color 0.25s',
    }}>
      {String(count).padStart(2, '0')}
    </span>
  </button>
);

/* ── Filter chip (mobile horizontal) ─────────────────────────── */
const FilterChip = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px',
      background: active ? ACCENT : 'transparent',
      color: active ? INK : MUTED,
      border: `1px solid ${active ? ACCENT : HAIRLINE_STRONG}`,
      cursor: 'pointer',
      fontFamily: fBody, fontSize: 12, fontWeight: 500,
      letterSpacing: '-0.005em',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }}
  >
    {label}
    <span style={{
      fontFamily: fMono, fontSize: 10,
      color: active ? INK : FAINT,
      opacity: active ? 0.7 : 1,
    }}>
      {String(count).padStart(2, '0')}
    </span>
  </button>
);

/* ── helpers ─────────────────────────────────────────────────── */
// Buckets temáticos: figura/sable/casco/lego. `category` los lleva en lowercase.
const PURPOSE_VALUES = new Set(['figura', 'sable', 'casco', 'lego']);

const getPurpose = (p) => {
  for (const v of [p?.category, p?.type, p?.purpose]) {
    const lower = String(v ?? '').toLowerCase();
    if (PURPOSE_VALUES.has(lower)) return lower;
  }
  return '';
};

const isFlashOffer = (p) =>
  p?.approved === true || p?.approved === 'true';

/* ── Sidebar (desktop) ───────────────────────────────────────── */
const Sidebar = ({ counts, selectedQuadrant, onSelectQuadrant, purposeFilter, setPurposeFilter }) => {
  const hasFilters = selectedQuadrant || purposeFilter;

  return (
    <div style={{ position: 'sticky', top: 80 }}>
      <Micro style={{ display: 'block', marginBottom: 18 }}>Valor</Micro>

      <FilterRow
        label="Oferta Relámpago" count={counts.legendary}
        active={selectedQuadrant === 'legendary'}
        onClick={() => onSelectQuadrant(selectedQuadrant === 'legendary' ? null : 'legendary')}
      />

      <Micro style={{ display: 'block', marginTop: 36, marginBottom: 18 }}>Categoría</Micro>

      <FilterRow
        label="Figuras" count={counts.figura}
        active={purposeFilter === 'figura'}
        onClick={() => setPurposeFilter(purposeFilter === 'figura' ? null : 'figura')}
      />
      <FilterRow
        label="Sables" count={counts.sable}
        active={purposeFilter === 'sable'}
        onClick={() => setPurposeFilter(purposeFilter === 'sable' ? null : 'sable')}
      />
      <FilterRow
        label="Cascos" count={counts.casco}
        active={purposeFilter === 'casco'}
        onClick={() => setPurposeFilter(purposeFilter === 'casco' ? null : 'casco')}
      />
      <FilterRow
        label="LEGO" count={counts.lego}
        active={purposeFilter === 'lego'}
        onClick={() => setPurposeFilter(purposeFilter === 'lego' ? null : 'lego')}
      />

      {hasFilters && (
        <button
          onClick={() => { onSelectQuadrant(null); setPurposeFilter(null); }}
          style={{
            marginTop: 28, fontFamily: fMono, fontSize: 10,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: MUTED, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = CREAM}
          onMouseLeave={e => e.currentTarget.style.color = MUTED}
        >
          ← Limpiar
        </button>
      )}
    </div>
  );
};

/* ── Filter bar (mobile horizontal) ──────────────────────────── */
const FilterBar = ({ counts, selectedQuadrant, onSelectQuadrant, purposeFilter, setPurposeFilter }) => {
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto',
      paddingBottom: 12, marginBottom: 12,
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
    }}>
      <FilterChip label="Oferta" count={counts.legendary} active={selectedQuadrant === 'legendary'} onClick={() => onSelectQuadrant(selectedQuadrant === 'legendary' ? null : 'legendary')} />
      <FilterChip label="Figuras" count={counts.figura}   active={purposeFilter === 'figura'}       onClick={() => setPurposeFilter(purposeFilter === 'figura' ? null : 'figura')} />
      <FilterChip label="Sables"  count={counts.sable}    active={purposeFilter === 'sable'}        onClick={() => setPurposeFilter(purposeFilter === 'sable' ? null : 'sable')} />
      <FilterChip label="Cascos"  count={counts.casco}    active={purposeFilter === 'casco'}        onClick={() => setPurposeFilter(purposeFilter === 'casco' ? null : 'casco')} />
      <FilterChip label="LEGO"    count={counts.lego}     active={purposeFilter === 'lego'}         onClick={() => setPurposeFilter(purposeFilter === 'lego' ? null : 'lego')} />
    </div>
  );
};

/* ── Product Card (limpia, sin estrellas, imagen blanca) ─────── */
const ProductCard = ({ product, onViewDetail }) => {
  const [hovered, setHovered] = useState(false);
  const tag = isFlashOffer(product)
    ? { label: 'Oferta Relámpago', variant: 'flash' }
    : null;
  const price = parseFloat(product.price_offer ?? product.price_unit ?? product.price ?? 0);
  const originalPrice = product.price_offer ? parseFloat(product.price ?? product.price_unit ?? 0) : null;
  const discount = originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const specs = [product.faction, product.era, product.character_related, product.description].filter(Boolean).join(' · ');

  return (
    <article
      onClick={() => onViewDetail(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: PANEL,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        border: `1px solid ${hovered ? HAIRLINE_STRONG : HAIRLINE}`,
        transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 18px 40px -12px rgba(0,0,0,0.6)' : '0 0 0 rgba(0,0,0,0)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Image — fondo blanco como Amazon */}
      <div style={{
        position: 'relative',
        background: WHITE,
        aspectRatio: '4/3',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={product.main_image ?? product.image ?? product.images?.[0]?.image ?? ''}
          alt={product.name}
          style={{
            maxWidth: '85%', maxHeight: '85%',
            width: 'auto', height: 'auto',
            objectFit: 'contain',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Info area — todo alineado verticalmente */}
      <div style={{
        padding: '16px 16px 18px',
        flex: 1,
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        {/* Brand */}
        <div style={{ minHeight: 14, marginBottom: 8 }}>
          {product.brand && (
            <Micro style={{ letterSpacing: '0.18em', opacity: 0.75 }}>{product.brand}</Micro>
          )}
        </div>

        {/* Title — altura fija 2 líneas */}
        <h3 style={{
          fontFamily: fBody, fontSize: 14, fontWeight: 500,
          color: CREAM, lineHeight: 1.4, letterSpacing: '-0.005em',
          margin: '0 0 12px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          height: 39,
        }}>
          {product.name}
        </h3>

        {/* Tag — altura fija (incluso si no hay tag, reserva el espacio para alineación) */}
        <div style={{ minHeight: 22, marginBottom: 12 }}>
          {tag && <Tag label={tag.label} variant={tag.variant} />}
        </div>

        {/* Discount + Price — fila bien alineada */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10,
          marginBottom: 4, flexWrap: 'wrap',
        }}>
          {discount > 0 && (
            <span style={{
              fontFamily: fBody, fontSize: 15, fontWeight: 600,
              color: RED, letterSpacing: '-0.01em', lineHeight: 1,
            }}>
              -{discount}%
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontFamily: fBody, fontSize: 12, color: MUTED,
              fontWeight: 500, lineHeight: 1,
            }}>
              S/
            </span>
            <span style={{
              fontFamily: fDisplay, fontSize: 24, fontWeight: 500,
              color: CREAM, letterSpacing: '-0.025em', lineHeight: 1,
            }}>
              {price.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* PVPR — altura fija */}
        <div style={{ minHeight: 16, marginBottom: 12 }}>
          {originalPrice && (
            <div style={{
              fontFamily: fBody, fontSize: 11, color: FAINT, lineHeight: 1.4,
            }}>
              PVPR: <span style={{ textDecoration: 'line-through' }}>
                S/{originalPrice.toLocaleString('es-PE')}
              </span>
            </div>
          )}
        </div>

        {/* Specs */}
        {specs && (
          <p style={{
            fontFamily: fBody, fontSize: 12, color: MUTED,
            lineHeight: 1.5, margin: '0 0 6px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {specs}
          </p>
        )}

        {/* Delivery */}
        <p style={{
          fontFamily: fBody, fontSize: 11, color: MUTED,
          lineHeight: 1.5, margin: '0 0 14px',
        }}>
          Entrega <span style={{ color: CREAM, fontWeight: 600 }}>GRATIS</span> en Lima · 24–48h
        </p>

        {/* CTA "Ver detalle" — siempre visible, hover acento */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: `1px solid ${HAIRLINE}`,
          }}>
            <span style={{
              fontFamily: fBody, fontSize: 12, fontWeight: 500,
              color: hovered ? ACCENT : MUTED,
              transition: 'color 0.2s',
            }}>
              Ver detalle
            </span>
            <span style={{
              fontFamily: fBody, fontSize: 14,
              color: hovered ? ACCENT : MUTED,
              transition: 'color 0.2s, transform 0.2s',
              transform: hovered ? 'translateX(2px)' : 'translateX(0)',
            }}>
              →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ── Main Catalog ────────────────────────────────────────────── */
export const LaptopAdvisorCatalog = ({
  products = [],
  onViewDetail,
  search = '',
  onSearchChange,
  purpose: purposeProp,
  onPurposeChange,
  flashOnly: flashOnlyProp,
  onFlashOnlyChange,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}) => {
  const { isMobile, isTablet } = useBreakpoint();

  // Modo controlado (IntegratedCatalog pasa setters → filtro va al back) vs
  // uncontrolled (LandingPage2 no pasa setters → estado local + filter cliente).
  const isControlled = typeof onPurposeChange === 'function';
  const [internalPurpose, setInternalPurpose]   = useState(null);
  const [internalFlash, setInternalFlash]       = useState(false);
  const purpose   = isControlled ? (purposeProp ?? null)   : internalPurpose;
  const flashOnly = isControlled ? !!flashOnlyProp         : internalFlash;
  const setPurpose = (v) => (isControlled ? onPurposeChange(v)        : setInternalPurpose(v));
  const setFlash   = (v) => (isControlled ? onFlashOnlyChange?.(v)    : setInternalFlash(v));

  const safe = useMemo(() => Array.isArray(products) ? products : [], [products]);

  // Filtro cliente como capa defensiva: garantiza UI consistente aunque el back no
  // esté reiniciado, y es la única fuente de verdad en modo uncontrolled (landing).
  const filtered = useMemo(() => safe.filter(p => {
    if (!p || p.is_active === false) return false;
    if (flashOnly && !isFlashOffer(p)) return false;
    if (purpose && getPurpose(p) !== purpose) return false;
    return true;
  }), [safe, flashOnly, purpose]);

  // Counts independientes del filtro activo: pool sin filtros (compartido vía
  // React Query con cualquier otro consumidor que pida lo mismo). Así los chips
  // de Gaming/Office no caen a 0 cuando se selecciona el contrario.
  const { data: countsData } = useProducts({ limit: 200 });
  const countPool = useMemo(
    () => countsData?.pages?.flatMap(p => p.items) ?? [],
    [countsData],
  );
  const counts = useMemo(() => {
    const pool = countPool.length > 0 ? countPool : safe;
    return {
      legendary: pool.filter(isFlashOffer).length,
      figura:    pool.filter(p => getPurpose(p) === 'figura').length,
      sable:     pool.filter(p => getPurpose(p) === 'sable').length,
      casco:     pool.filter(p => getPurpose(p) === 'casco').length,
      lego:      pool.filter(p => getPurpose(p) === 'lego').length,
    };
  }, [countPool, safe]);

  const selectedQuadrant    = flashOnly ? 'legendary' : null;
  const setSelectedQuadrant = (v) => setFlash(v === 'legendary');
  const purposeFilter       = purpose;
  const setPurposeFilter    = setPurpose;

  return (
    <div style={{
      background: INK, fontFamily: fBody,
      borderTop: `1px solid ${HAIRLINE}`,
    }}>

      {/* ── Header ── */}
      <div style={{
        borderBottom: `1px solid ${HAIRLINE}`,
        padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,80px) clamp(32px,4vw,48px)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 28, height: 1, background: 'var(--accent-dim)' }} />
            <Micro>Catálogo · {safe.length} piezas</Micro>
          </div>

          {/* Headline + Search */}
          <div style={{
            display: 'flex',
            flexDirection: isTablet ? 'column' : 'row',
            alignItems: isTablet ? 'stretch' : 'flex-end',
            justifyContent: 'space-between',
            gap: isTablet ? 28 : 48,
          }}>
            <h1 style={{
              fontFamily: fDisplay, fontWeight: 300,
              fontSize: 'clamp(34px, 6vw, 68px)',
              lineHeight: 1.02, letterSpacing: '-0.035em',
              color: CREAM, margin: 0,
            }}>
              Encuentra tu <strong style={{ fontWeight: 600 }}>pieza ideal.</strong>
            </h1>

            <div style={{ flex: '0 0 auto', minWidth: 240, width: isTablet ? '100%' : '35%', maxWidth: 400 }}>
              <label style={{
                fontFamily: fMono, fontSize: 10, fontWeight: 400,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: FAINT, display: 'block', marginBottom: 10,
              }}>
                Buscar
              </label>
              <input
                value={search}
                onChange={e => onSearchChange ? onSearchChange(e.target.value) : null}
                placeholder="Marca, modelo, specs…"
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', borderBottom: `1px solid ${HAIRLINE_STRONG}`,
                  padding: '10px 0', fontFamily: fBody, fontSize: 14,
                  color: CREAM, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.25s',
                }}
                onFocus={e => e.target.style.borderBottomColor = ACCENT}
                onBlur={e => e.target.style.borderBottomColor = HAIRLINE_STRONG}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px) clamp(64px,8vw,120px)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(180px, 220px) 1fr',
        gap: isMobile ? 24 : 'clamp(40px, 5vw, 72px)',
      }}>

        {/* Filters: sidebar desktop, chip bar mobile */}
        {isMobile ? (
          <FilterBar
            counts={counts}
            selectedQuadrant={selectedQuadrant}
            onSelectQuadrant={setSelectedQuadrant}
            purposeFilter={purposeFilter}
            setPurposeFilter={setPurposeFilter}
          />
        ) : (
          <Sidebar
            counts={counts}
            selectedQuadrant={selectedQuadrant}
            onSelectQuadrant={setSelectedQuadrant}
            purposeFilter={purposeFilter}
            setPurposeFilter={setPurposeFilter}
          />
        )}

        <div>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16,
            marginBottom: 24, paddingBottom: 16,
            borderBottom: `1px solid ${HAIRLINE}`,
          }}>
            <Micro>
              {String(filtered.length).padStart(2, '0')} / {String(safe.length).padStart(2, '0')} resultados
            </Micro>
            {filtered.length > 0 && !isMobile && (
              <Micro>Click para detalle</Micro>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
              <Micro style={{ display: 'block', marginBottom: 16 }}>Sin resultados</Micro>
              <p style={{
                fontFamily: fDisplay, fontSize: 18, fontWeight: 300,
                color: MUTED, letterSpacing: '-0.01em',
              }}>
                Ningún equipo coincide con los filtros.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '160px' : '240px'}, 1fr))`,
              gap: 'clamp(14px, 1.8vw, 24px)',
            }}>
              {filtered.map(p => (
                <ProductCard key={p.id ?? p.id_product} product={p} onViewDetail={onViewDetail} />
              ))}
            </div>
          )}

          {hasNextPage && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
                style={{
                  padding: '14px 40px',
                  background: 'transparent',
                  border: `1px solid ${HAIRLINE_STRONG}`,
                  color: isFetchingNextPage ? FAINT : MUTED,
                  fontFamily: fMono, fontSize: 10,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isFetchingNextPage) { e.currentTarget.style.color = CREAM; e.currentTarget.style.borderColor = HAIRLINE_STRONG; } }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}
              >
                {isFetchingNextPage ? 'Cargando…' : 'Ver más →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaptopAdvisorCatalog;
