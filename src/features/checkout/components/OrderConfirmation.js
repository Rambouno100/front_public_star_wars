import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { INVOICING_ENABLED } from '../../../shared/lib/features';

/* ── Design tokens (sistema dark) ────────────────────────────── */
const INK      = 'var(--bg-ink)';
const PANEL    = 'var(--bg-panel)';
const HAIRLINE = 'var(--hairline)';
const HAIRLINE_STRONG = 'var(--hairline-strong)';
const CREAM    = 'var(--color-cream)';
const MUTED    = 'var(--color-muted)';
const FAINT    = 'var(--color-faint)';
const ACCENT   = 'var(--accent)';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fMono    = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody    = "'Inter', system-ui, sans-serif";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (window.gtag && amount) {
      window.gtag('event', 'purchase', { transaction_id: Date.now(), value: parseFloat(amount), currency: 'PEN' });
    }
  }, [amount]);

  return (
    <div style={{
      minHeight: '100vh', background: INK, fontFamily: fBody,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>

        {/* Check mark con glow acento */}
        <div style={{
          width: 64, height: 64,
          border: `1px solid ${ACCENT}`,
          borderRadius: '50%',
          margin: '0 auto 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px var(--accent-tint)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="square">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Eyebrow */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 28, height: 1, background: 'var(--accent-dim)' }} />
          <span style={{
            fontFamily: fMono, fontSize: 10, fontWeight: 400,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: FAINT,
          }}>
            Pago confirmado
          </span>
          <div style={{ width: 28, height: 1, background: 'var(--accent-dim)' }} />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: fDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)',
          letterSpacing: '-0.035em', lineHeight: 1.05,
          color: CREAM, margin: '0 0 16px',
        }}>
          Pedido <strong style={{ fontWeight: 600 }}>exitoso.</strong>
        </h1>

        <p style={{
          fontFamily: fBody, fontSize: 14, color: MUTED,
          lineHeight: 1.65, margin: '0 0 40px',
        }}>
          Tu pago fue procesado correctamente. Recibirás un comprobante y coordinaremos la entrega contigo por WhatsApp.
        </p>

        {/* Amount panel */}
        {amount && (
          <div style={{
            background: PANEL,
            border: `1px solid ${HAIRLINE_STRONG}`,
            padding: '24px 28px',
            marginBottom: 36,
          }}>
            <div style={{
              fontFamily: fMono, fontSize: 10, fontWeight: 400,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: FAINT, marginBottom: 12,
            }}>
              Total pagado
            </div>
            <div style={{
              display: 'flex', alignItems: 'baseline',
              justifyContent: 'center', gap: 8,
            }}>
              <span style={{ fontFamily: fMono, fontSize: 14, color: MUTED, letterSpacing: '0.06em' }}>S/</span>
              <span style={{
                fontFamily: fDisplay, fontWeight: 500, fontSize: 42,
                color: CREAM, letterSpacing: '-0.035em', lineHeight: 1,
              }}>
                {parseFloat(amount).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Trust strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          marginBottom: 40,
          background: PANEL,
          border: `1px solid ${HAIRLINE}`,
        }}>
          {[
            // Comprobantes: se muestra solo si podemos emitir (shared/lib/features).
            ...(INVOICING_ENABLED ? [{ n: 'Boleta / Factura', d: 'Emitida en 24h' }] : []),
            { n: '100% Original',    d: 'Verificado' },
          ].map(({ n, d }, i) => (
            <div key={n} style={{
              padding: '18px 14px', textAlign: 'center',
              borderLeft: i > 0 ? `1px solid ${HAIRLINE}` : 'none',
            }}>
              <div style={{ fontFamily: fBody, fontSize: 13, fontWeight: 500, color: CREAM }}>{n}</div>
              <div style={{
                fontFamily: fMono, fontSize: 10, color: FAINT,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                marginTop: 6,
              }}>
                {d}
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/mis-pedidos')}
            style={{
              padding: '14px 28px', background: CREAM, color: INK,
              border: 'none', cursor: 'pointer',
              fontFamily: fMono, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = ACCENT}
            onMouseLeave={e => e.currentTarget.style.background = CREAM}
          >
            Ver mis pedidos →
          </button>
          <a
            href="https://wa.me/51956787186"
            target="_blank" rel="noopener noreferrer"
            style={{
              padding: '14px 28px',
              background: 'transparent', color: MUTED,
              border: `1px solid ${HAIRLINE}`, textDecoration: 'none',
              fontFamily: fMono, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = CREAM; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}
            onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = HAIRLINE; }}
          >
            Contactar WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
