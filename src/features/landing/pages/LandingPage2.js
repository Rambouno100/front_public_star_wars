import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../catalog/hooks/useProducts';
import { LaptopAdvisorCatalog } from '../../catalog/components/LaptopAdvisorCatalog';
import logoUrl from '../../../assets/logo.svg';   // ← LOGO DE ORIGEN ÚNICO (cámbialo en src/assets/logo.svg)
import { INVOICING_ENABLED } from '../../../shared/lib/features';

/* ── Design tokens (unificados con LaptopAdvisorCatalog) ────── */
const INK      = 'var(--bg-ink)';
const CARBON   = 'var(--bg-panel)';
const HAIRLINE = 'var(--hairline)';
const HAIRLINE_STRONG = 'var(--hairline-strong)';
const CREAM    = 'var(--color-cream)';
const MUTED    = 'var(--color-muted)';
const FAINT    = 'var(--color-faint)';
const ACCENT   = 'var(--accent)';
const ACCENT_DIM = 'var(--accent-dim)';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fMono    = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody    = "'Inter', system-ui, sans-serif";

const WA = 'https://wa.me/51956787186';

/* ── Hook breakpoint ─────────────────────────────────────────── */
const useBreakpoint = () => {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 640, isTablet: w < 960, w };
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

/* ── Stroke / Solid Button ───────────────────────────────────── */
const Btn = ({ href, to, onClick, children, primary = false }) => {
  const [hov, setHov] = useState(false);

  const base = {
    fontFamily: fMono, fontSize: 11, fontWeight: 500,
    letterSpacing: '0.16em', textTransform: 'uppercase',
    padding: '14px 28px',
    cursor: 'pointer', textDecoration: 'none',
    display: 'inline-block', textAlign: 'center',
    transition: 'all 0.25s ease',
    border: '1px solid',
  };

  const style = primary
    ? {
        ...base,
        background: hov ? ACCENT : CREAM,
        color: INK,
        borderColor: hov ? ACCENT : CREAM,
      }
    : {
        ...base,
        background: 'transparent',
        color: hov ? CREAM : MUTED,
        borderColor: hov ? HAIRLINE_STRONG : HAIRLINE,
      };

  const handlers = {
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
  };

  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={style} {...handlers}>{children}</a>;
  if (onClick) return <button onClick={onClick} style={style} {...handlers}>{children}</button>;
  return <Link to={to} style={style} {...handlers}>{children}</Link>;
};

/* ── HERO ────────────────────────────────────────────────────── */
const Hero = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const [hov, setHov] = useState(false);
  const { data } = useProducts({ limit: 200 });

  // Producto destacado = el de MAYOR descuento (%) del catálogo.
  // Fallback: si nadie tiene descuento, el primero del ranking.
  const featured = useMemo(() => {
    const pool = data?.pages?.flatMap(p => p.items) ?? [];
    if (pool.length === 0) return null;
    const withDiscount = pool
      .map(p => {
        const price = parseFloat(p.price ?? 0);
        const offer = p.price_offer != null ? parseFloat(p.price_offer) : null;
        const disc = offer && price > 0 && offer < price ? (1 - offer / price) * 100 : 0;
        return { p, disc };
      })
      .filter(x => x.disc > 0)
      .sort((a, b) => b.disc - a.disc);
    return withDiscount.length > 0 ? withDiscount[0].p : pool[0];
  }, [data]);

  const featuredPrice = featured ? parseFloat(featured.price_offer ?? featured.price ?? 0) : 0;
  const featuredOriginal = featured?.price_offer != null ? parseFloat(featured.price ?? 0) : null;
  const featuredDiscount = featuredOriginal && featuredOriginal > featuredPrice
    ? Math.round((1 - featuredPrice / featuredOriginal) * 100)
    : 0;

  return (
    <section style={{
      background: INK,
      borderBottom: `1px solid ${HAIRLINE}`,
      padding: isMobile ? '72px 24px 64px' : '120px 80px 96px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background subtle accent — gamer touch sutil */}
      <div style={{
        position: 'absolute',
        top: '50%', right: '-15%',
        width: 520, height: 520,
        background: `radial-gradient(circle, var(--accent-tint) 0%, transparent 60%)`,
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto', position: 'relative',
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1.05fr 0.95fr',
        gap: isTablet ? 40 : 64,
        alignItems: 'center',
      }}>

        {/* Left — copy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 28, height: 1, background: ACCENT_DIM }} />
            <Micro style={{ whiteSpace: 'normal' }}>Construcción · Cascos · Llaveros · Pósters</Micro>
          </div>

          <h1 style={{
            fontFamily: fDisplay, fontWeight: 300,
            fontSize: 'clamp(40px, 7vw, 88px)',
            letterSpacing: '-0.035em', lineHeight: 1.02,
            color: CREAM, margin: '0 0 28px',
            maxWidth: 920,
          }}>
            Ármalo hoy.{' '}
            <strong style={{ fontWeight: 600 }}>Exhíbelo siempre.</strong>
          </h1>

          <p style={{
            fontFamily: fBody, fontSize: 'clamp(15px, 1.2vw, 17px)',
            color: MUTED, lineHeight: 1.65,
            margin: '0 0 48px', maxWidth: 520,
          }}>
            Sets de bloques, cascos, llaveros y piezas de colección para armar. Originales, en caja sellada y con envío a todo el Perú.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!isMobile && <Btn href={WA} primary>Cotizar por WhatsApp</Btn>}
            <Btn to="/catalogo">Ver catálogo</Btn>
          </div>
        </div>

        {/* Right — featured product visual */}
        {featured && (
          <Link
            to={`/product/${featured.id_product ?? featured.id}`}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'stretch',
              background: CARBON,
              border: `1px solid ${hov ? HAIRLINE_STRONG : HAIRLINE}`,
              textDecoration: 'none',
              overflow: 'hidden',
              transform: hov ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s, box-shadow 0.3s',
              boxShadow: hov ? '0 20px 44px -14px rgba(0,0,0,0.6)' : 'none',
            }}
          >
            {/* Image */}
            <div style={{
              background: '#FFFFFF',
              aspectRatio: isMobile ? '1/1' : '4/3',
              width: '100%',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={featured.main_image ?? featured.img ?? featured.images?.[0]?.image ?? ''}
                alt={featured.name}
                loading="eager"
                style={{
                  maxWidth: '88%', maxHeight: '88%',
                  width: 'auto', height: 'auto',
                  objectFit: 'contain',
                  transform: hov ? 'scale(1.04)' : 'scale(1)',
                  transition: 'transform 0.5s ease',
                }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 1, background: 'var(--accent-dim)' }} />
                  <Micro color={ACCENT}>Mayor descuento</Micro>
                </div>
                {featuredDiscount > 0 && (
                  <span style={{
                    fontFamily: fBody, fontSize: 15, fontWeight: 700,
                    color: 'var(--danger)', letterSpacing: '-0.01em', lineHeight: 1,
                  }}>
                    -{featuredDiscount}%
                  </span>
                )}
              </div>

              <div style={{
                fontFamily: fDisplay, fontWeight: 400, fontSize: 20,
                color: CREAM, lineHeight: 1.3, letterSpacing: '-0.015em',
                display: '-webkit-box', WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {featured.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: fMono, fontSize: 12, color: MUTED }}>S/</span>
                <span style={{
                  fontFamily: fDisplay, fontSize: 30, fontWeight: 500,
                  color: CREAM, letterSpacing: '-0.025em', lineHeight: 1,
                }}>
                  {featuredPrice.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                </span>
                {featuredOriginal && (
                  <span style={{
                    fontFamily: fBody, fontSize: 12, color: FAINT,
                    textDecoration: 'line-through', marginLeft: 2,
                  }}>
                    S/{featuredOriginal.toLocaleString('es-PE')}
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 12, marginTop: 'auto',
                borderTop: `1px solid ${HAIRLINE}`,
              }}>
                <span style={{
                  fontFamily: fBody, fontSize: 12, fontWeight: 500,
                  color: hov ? ACCENT : MUTED, transition: 'color 0.2s',
                }}>
                  Ver producto
                </span>
                <span style={{
                  fontFamily: fBody, fontSize: 14,
                  color: hov ? ACCENT : MUTED,
                  transition: 'color 0.2s, transform 0.2s',
                  transform: hov ? 'translateX(2px)' : 'translateX(0)',
                }}>
                  →
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
};

/* ── TRUST STRIP ─────────────────────────────────────────────── */
const Trust = () => {
  const { isMobile } = useBreakpoint();

  const items = [
    { num: '200+',  label: 'Clientes' },
    { num: <span style={{ color: ACCENT, letterSpacing: '0.06em', fontSize: 18 }}>★★★★★</span>, label: '5.0 en Facebook' },
    { num: '100%',  label: 'Originales' },
    { num: 'IGV',   label: 'Incluido' },
  ];

  return (
    <div style={{
      background: CARBON,
      borderBottom: `1px solid ${HAIRLINE}`,
      padding: isMobile ? '24px' : '28px 80px',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${items.length}, 1fr)`,
        gap: isMobile ? '20px 16px' : 24,
      }}>
        {items.map(({ num, label }, i) => (
          <div key={label} style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            borderLeft: !isMobile && i !== 0 ? `1px solid ${HAIRLINE}` : 'none',
            paddingLeft: !isMobile && i !== 0 ? 24 : 0,
          }}>
            <span style={{
              fontFamily: fDisplay, fontWeight: 500,
              fontSize: 22, letterSpacing: '-0.02em',
              color: CREAM, lineHeight: 1,
            }}>
              {num}
            </span>
            <Micro>{label}</Micro>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── CATALOG (reutiliza LaptopAdvisorCatalog) ────────────────── */
const CatalogSection = () => {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [purpose, setPurpose] = useState(null);
  const [flashOnly, setFlashOnly] = useState(false);
  const debounceRef = useRef(null);

  const handleSearchChange = useCallback((value) => {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 400);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useProducts({ q: search, purpose, flashOnly, limit: 20 });
  const navigate = useNavigate();

  const products = useMemo(
    () => data?.pages?.flatMap(p => p.items) ?? [],
    [data]
  );

  if (isLoading && !data) return (
    <section style={{
      background: INK, padding: '160px 24px',
      borderBottom: `1px solid ${HAIRLINE}`, textAlign: 'center',
    }}>
      <Micro>Cargando catálogo…</Micro>
    </section>
  );

  if (isError) return (
    <section style={{
      background: INK, padding: '160px 24px',
      borderBottom: `1px solid ${HAIRLINE}`, textAlign: 'center',
    }}>
      <Micro style={{ display: 'block', marginBottom: 16 }}>Error</Micro>
      <p style={{ fontFamily: fBody, fontSize: 14, color: MUTED, marginBottom: 28 }}>
        No se pudo cargar el catálogo.
      </p>
      <Btn href={WA} primary>Cotizar por WhatsApp</Btn>
    </section>
  );

  return (
    <LaptopAdvisorCatalog
      products={products}
      onViewDetail={p => navigate(`/product/${p.id ?? p.id_product}`)}
      search={inputValue}
      onSearchChange={handleSearchChange}
      purpose={purpose}
      onPurposeChange={setPurpose}
      flashOnly={flashOnly}
      onFlashOnlyChange={setFlashOnly}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    />
  );
};

/* ── CTA ─────────────────────────────────────────────────────── */
const CTA = () => {
  const { isMobile } = useBreakpoint();

  return (
    <section style={{
      background: INK,
      borderTop: `1px solid ${HAIRLINE}`,
      borderBottom: `1px solid ${HAIRLINE}`,
      padding: isMobile ? '88px 24px' : '128px 80px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 32 : 80,
          alignItems: 'end',
        }}>
          {/* Left: headline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 28, height: 1, background: ACCENT_DIM }} />
              <Micro>¿No encuentras tu modelo?</Micro>
            </div>
            <h2 style={{
              fontFamily: fDisplay, fontWeight: 300,
              fontSize: 'clamp(32px, 5vw, 60px)',
              letterSpacing: '-0.035em', lineHeight: 1.05,
              color: CREAM, margin: 0,
            }}>
              Pide tu pieza{' '}
              <strong style={{ fontWeight: 600 }}>a medida.</strong>
            </h2>
          </div>

          {/* Right: copy + actions */}
          <div style={{
            borderLeft: isMobile ? 'none' : `1px solid ${HAIRLINE}`,
            paddingLeft: isMobile ? 0 : 48,
          }}>
            <p style={{
              fontFamily: fBody, fontSize: 16,
              color: MUTED, lineHeight: 1.65,
              margin: '0 0 36px', maxWidth: 440,
            }}>
              Escríbenos y conseguimos exactamente lo que necesitas.
              Respuesta en menos de 24 horas.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn href={WA} primary>WhatsApp</Btn>
              <Btn to="/catalogo">Ver catálogo</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── FOOTER ──────────────────────────────────────────────────── */
const Footer = () => {
  const { isMobile } = useBreakpoint();

  const links = [
    ['Catálogo',  '/catalogo'],
    ['Garantía',  '/garantia'],
    ['Referidos', '/referidos'],
  ];

  return (
    <footer style={{
      background: INK,
      padding: isMobile ? '40px 24px 32px' : '56px 80px 36px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: isMobile ? 28 : 16,
          paddingBottom: 28,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            }}>
              <img src={logoUrl} alt="Armalo" width="63" height="24" style={{ display: 'block' }} />
            </div>
            <Micro>{INVOICING_ENABLED ? 'Lima · Perú · RUC 20613999818' : 'Lima · Perú'}</Micro>
          </div>

          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {links.map(([l, u]) => (
              <Link
                key={l} to={u}
                style={{
                  fontFamily: fMono, fontSize: 11,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: MUTED, textDecoration: 'none',
                  transition: 'color 0.25s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = CREAM}
                onMouseLeave={e => e.currentTarget.style.color = MUTED}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>

        <div style={{
          paddingTop: 20,
          display: 'flex', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
        }}>
          <Micro>© 2025 Armalo</Micro>
          <Micro>Hecho en Lima</Micro>
        </div>
      </div>
    </footer>
  );
};

/* ── ROOT ────────────────────────────────────────────────────── */
export default function ArmaloLanding() {
  return (
    <div style={{ background: INK, minHeight: '100vh' }}>
      <Hero />
      <Trust />
      <CatalogSection />
      <CTA />
      <Footer />
    </div>
  );
}
