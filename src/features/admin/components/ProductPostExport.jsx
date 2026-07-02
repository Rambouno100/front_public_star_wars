import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  X, Download, Loader2, Image as ImageIcon, AlertTriangle,
  Copy, Check, RotateCw, Maximize2, Clock,
} from 'lucide-react';
import { adminGetProductPostImage } from '../api';

/* ── Brand tokens (mirror public ProductDetail) ─────────────── */
const INK             = '#0A0A0B';
const INK_DEEP        = '#050506';
const HAIRLINE        = 'rgba(245,245,240,0.08)';
const HAIRLINE_STRONG = 'rgba(245,245,240,0.14)';
const CREAM           = '#F5F5F0';
const MUTED           = 'rgba(245,245,240,0.55)';
const FAINT           = 'rgba(245,245,240,0.32)';
const ACCENT          = '#A3FF7C';
const RED             = '#FF4D4D';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fMono    = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody    = "'Inter', system-ui, sans-serif";

/* Facebook feed sweet spot: 4:5 vertical, ocupa más pixeles en el scroll. */
const POST_W = 1080;
const POST_H = 1350;
/* FB recorta el caption a ~125 chars antes de "...Ver más" */
const FB_FIRST_LINE_LIMIT = 125;

const HOOK_BY_APPROVED = {
  'Price/Quality': 'OFERTA RELÁMPAGO',
  Price:           'MEJOR PRECIO',
  Quality:         'CALIDAD TOP',
};

const slugify = s => (s || 'producto').toString().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);

const tagify = s => (s || '').toString().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '');

const formatPrice = v => `S/ ${parseFloat(v || 0).toFixed(2)}`;

/* Caption listo para Facebook: hook → nombre/marca → precio/oferta → CTA → hashtags.
   Primer renglón mantiene el "gancho" comprimido para no caer en el corte "Ver más". */
const buildCaption = (p) => {
  const hook    = HOOK_BY_APPROVED[p.approved] || 'NUEVO DROP';
  const base    = parseFloat(p.price || 0);
  const offer   = p.price_offer ? parseFloat(p.price_offer) : null;
  const hasOff  = offer && offer < base;
  const off     = hasOff ? Math.round((1 - offer / base) * 100) : 0;

  const headline = `${hook} — ${p.name}${p.brand ? ` · ${p.brand}` : ''}`;
  const priceLn  = hasOff
    ? `Antes ${formatPrice(base)} · Ahora ${formatPrice(offer)} (-${off}%)`
    : `Precio drop: ${formatPrice(base)}`;

  const tags = ['armalo'];
  if (p.category) tags.push(tagify(p.category));
  if (p.brand)    tags.push(tagify(p.brand));
  if (hasOff)     tags.push('oferta');
  tags.push('ofertasperu');
  const hashtags = Array.from(new Set(tags.filter(Boolean))).slice(0, 5)
    .map(t => `#${t}`).join(' ');

  return [
    headline,
    '',
    priceLn,
    'Stock limitado · Envío a todo el Perú.',
    '',
    'Link en el primer comentario.',
    '',
    hashtags,
  ].join('\n');
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const Micro = ({ children, color = FAINT, size = 16, style = {} }) => (
  <span style={{
    fontFamily: fMono, fontSize: size, fontWeight: 400,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color, ...style,
  }}>{children}</span>
);

export default function ProductPostExport({ products, onClose }) {
  // id -> { blob, blobUrl } | { error: string }
  const [renders, setRenders]           = useState({});
  const blobUrlsRef                     = useRef([]);
  const [previewScale, setPreviewScale] = useState(0.34);
  const [copiedId, setCopiedId]         = useState(null);
  const [lightboxId, setLightboxId]     = useState(null);
  const [retryTick, setRetryTick]       = useState({}); // id -> n; bump to re-fetch

  const captions = useMemo(
    () => Object.fromEntries(products.map(p => [p.id_product, buildCaption(p)])),
    [products],
  );

  /* Esc: cierra lightbox primero, luego el modal. */
  useEffect(() => {
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if (lightboxId) setLightboxId(null);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, lightboxId]);

  /* Pide al backend el JPG de cada producto que aún no tiene blob.
     Máx 2 en paralelo para no saturar Chromium en el render server-side. */
  useEffect(() => {
    let cancelled = false;
    const queue = products.filter(p => !renders[p.id_product]?.blob);
    const CONCURRENCY = 2;

    const fetchOne = async (p) => {
      try {
        const blob = await adminGetProductPostImage(p.id_product);
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.push(blobUrl);
        setRenders(s => ({ ...s, [p.id_product]: { blob, blobUrl } }));
      } catch (e) {
        if (cancelled) return;
        let msg = e?.message || 'Error desconocido';
        const data = e?.response?.data;
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            try {
              const parsed = JSON.parse(text);
              msg = parsed.detail || parsed.message || text;
            } catch {
              msg = text || msg;
            }
          } catch { /* keep msg */ }
        } else if (data?.detail) {
          msg = data.detail;
        }
        setRenders(s => ({ ...s, [p.id_product]: { error: msg } }));
        console.error('[PostExport] render failed for', p.id_product, e);
      }
    };

    const workers = Array.from(
      { length: Math.min(CONCURRENCY, queue.length) },
      async () => {
        while (queue.length > 0) {
          const p = queue.shift();
          if (!p) return;
          // eslint-disable-next-line no-await-in-loop
          await fetchOne(p);
        }
      },
    );
    Promise.all(workers);

    return () => { cancelled = true; };
  }, [products, retryTick]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Revoca blob URLs UNA sola vez al desmontar (no en cada cambio de deps). */
  useEffect(() => () => {
    blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];
  }, []);

  const retryOne = useCallback((id) => {
    setRenders(s => {
      const n = { ...s };
      delete n[id];
      return n;
    });
    setRetryTick(t => ({ ...t, [id]: (t[id] || 0) + 1 }));
  }, []);

  const downloadOne = (p) => {
    const entry = renders[p.id_product];
    if (!entry?.blob) return;
    triggerDownload(entry.blob, `armalo-${slugify(p.name)}-${p.id_product}.jpg`);
  };

  const downloadAll = () => {
    products.forEach((p, i) => {
      const entry = renders[p.id_product];
      if (!entry?.blob) return;
      setTimeout(() => {
        triggerDownload(entry.blob, `armalo-${slugify(p.name)}-${p.id_product}.jpg`);
      }, i * 220);
    });
  };

  const flashCopied = (id) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(c => (c === id ? null : c)), 1500);
  };

  const copyCaption = async (id) => {
    try {
      await navigator.clipboard.writeText(captions[id] || '');
      flashCopied(id);
    } catch (e) { console.warn('clipboard error', e); }
  };

  const copyAllCaptions = async () => {
    const block = products
      .map(p => `─── ${p.name} (id ${p.id_product}) ───\n${captions[p.id_product]}`)
      .join('\n\n\n');
    try {
      await navigator.clipboard.writeText(block);
      flashCopied('__all__');
    } catch (e) { console.warn('clipboard error', e); }
  };

  const readyCount   = products.filter(p => renders[p.id_product]?.blob).length;
  const errorCount   = products.filter(p => renders[p.id_product]?.error).length;
  const pendingCount = products.length - readyCount - errorCount;
  const allDone      = pendingCount === 0;
  const progress     = products.length === 0
    ? 0
    : (readyCount + errorCount) / products.length;
  const hasPlaywrightError = Object.values(renders).some(
    r => r?.error && /playwright/i.test(r.error),
  );

  const lightboxProduct = lightboxId
    ? products.find(p => p.id_product === lightboxId)
    : null;
  const lightboxEntry = lightboxId ? renders[lightboxId] : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ──── Header ──── */}
      <div style={{
        background: INK,
        borderBottom: `1px solid ${HAIRLINE_STRONG}`,
        flexShrink: 0,
      }}>
        <div style={{
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${HAIRLINE_STRONG}`,
            }}>
              <ImageIcon size={15} color={ACCENT} />
            </div>
            <div style={{ minWidth: 0 }}>
              <Micro size={10} style={{ display: 'block', marginBottom: 3 }}>
                Exportar a Facebook · Feed 4:5
              </Micro>
              <h2 style={{
                fontFamily: fDisplay, fontSize: 18, fontWeight: 600,
                color: CREAM, margin: 0, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap',
              }}>
                <span>{products.length} {products.length === 1 ? 'post' : 'posts'}</span>
                <span style={{ color: FAINT, fontWeight: 400, fontSize: 13 }}>
                  1080×1350 · JPG
                </span>
                {!allDone && (
                  <span style={{
                    color: ACCENT, fontFamily: fMono, fontSize: 11,
                    letterSpacing: '0.18em',
                  }}>
                    {readyCount}/{products.length}
                  </span>
                )}
                {allDone && errorCount > 0 && (
                  <span style={{
                    color: RED, fontFamily: fMono, fontSize: 11,
                    letterSpacing: '0.18em',
                  }}>
                    {errorCount} {errorCount === 1 ? 'falló' : 'fallaron'}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={copyAllCaptions}
              disabled={products.length === 0}
              title="Copia todos los copys al portapapeles, separados por título"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: 'transparent',
                color: copiedId === '__all__' ? ACCENT : CREAM,
                border: `1px solid ${copiedId === '__all__' ? ACCENT : HAIRLINE_STRONG}`,
                cursor: 'pointer',
                fontFamily: fBody, fontSize: 12, fontWeight: 500,
                transition: 'color 200ms ease, border-color 200ms ease',
              }}>
              {copiedId === '__all__' ? <Check size={13} /> : <Copy size={13} />}
              {copiedId === '__all__' ? 'Copiados' : 'Copiar copys'}
            </button>
            <button
              onClick={downloadAll}
              disabled={readyCount === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', background: ACCENT, color: INK,
                border: 'none', cursor: readyCount === 0 ? 'wait' : 'pointer',
                fontFamily: fBody, fontSize: 13, fontWeight: 700,
                opacity: readyCount === 0 ? 0.5 : 1,
              }}>
              <Download size={14} />
              Descargar {readyCount > 0 && readyCount < products.length ? `(${readyCount})` : 'todos'}
            </button>
            <button
              onClick={onClose}
              title="Cerrar (Esc)"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, background: 'transparent',
                border: `1px solid ${HAIRLINE_STRONG}`, color: MUTED, cursor: 'pointer',
              }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progreso global — comunica avance sin ruido visual */}
        <div style={{ height: 2, background: HAIRLINE, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            width: `${progress * 100}%`,
            background: errorCount > 0 ? RED : ACCENT,
            transition: 'width 280ms ease, background 240ms ease',
          }} />
        </div>
      </div>

      {/* ──── Body ──── */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '28px 24px',
        background: `linear-gradient(180deg, ${INK} 0%, ${INK_DEEP} 100%)`,
      }}>
        {hasPlaywrightError && (
          <div style={{
            maxWidth: 760, margin: '0 auto 20px',
            padding: '14px 18px',
            background: 'rgba(255,77,77,0.08)',
            border: `1px solid ${RED}`,
            color: CREAM, fontFamily: fBody, fontSize: 13, lineHeight: 1.5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <AlertTriangle size={16} color={RED} />
              <strong style={{ fontWeight: 600 }}>Playwright no está instalado en el backend.</strong>
            </div>
            En la carpeta <code style={{ color: ACCENT }}>backendv3/</code> ejecuta:
            <pre style={{
              marginTop: 8, padding: '10px 12px', background: '#000',
              fontFamily: fMono, fontSize: 12, color: ACCENT, overflowX: 'auto',
            }}>{`pip install -e ".[dev]"\nplaywright install chromium`}</pre>
            Reinicia el servidor de FastAPI y vuelve a abrir esta ventana.
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${Math.round(POST_W * previewScale) + 24}px, 1fr))`,
          gap: 32, justifyItems: 'center',
        }}>
          {products.map(p => {
            const entry      = renders[p.id_product];
            const ready      = !!entry?.blob;
            const failed     = !!entry?.error;
            const cardW      = POST_W * previewScale;
            const cardH      = POST_H * previewScale;
            const caption    = captions[p.id_product] || '';
            const firstLine  = caption.split('\n')[0] || '';
            const fLen       = firstLine.length;
            const hookOk     = fLen <= FB_FIRST_LINE_LIMIT;
            const hasOff     = p.price_offer && parseFloat(p.price_offer) < parseFloat(p.price);
            const off        = hasOff
              ? Math.round((1 - parseFloat(p.price_offer) / parseFloat(p.price)) * 100)
              : 0;

            return (
              <div key={p.id_product} style={{
                display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
              }}>
                {/* Frame de previa */}
                <div
                  onClick={() => ready && setLightboxId(p.id_product)}
                  style={{
                    width: cardW, height: cardH,
                    border: `1px solid ${HAIRLINE_STRONG}`,
                    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
                    background: INK,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', position: 'relative',
                    cursor: ready ? 'zoom-in' : 'default',
                    transition: 'transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
                  }}
                  onMouseEnter={e => {
                    if (!ready) return;
                    e.currentTarget.style.borderColor = 'rgba(163,255,124,0.40)';
                    e.currentTarget.style.transform   = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow   = '0 40px 70px -18px rgba(0,0,0,0.7)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = HAIRLINE_STRONG;
                    e.currentTarget.style.transform   = 'translateY(0)';
                    e.currentTarget.style.boxShadow   = '0 30px 60px -20px rgba(0,0,0,0.6)';
                  }}
                >
                  {ready ? (
                    <>
                      <img
                        src={entry.blobUrl}
                        alt={p.name}
                        style={{
                          width: '100%', height: '100%',
                          display: 'block', objectFit: 'contain',
                        }}
                      />
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 26, height: 26, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(10,10,11,0.7)',
                        backdropFilter: 'blur(6px)',
                        color: CREAM, pointerEvents: 'none',
                      }}>
                        <Maximize2 size={12} />
                      </div>
                    </>
                  ) : failed ? (
                    <div style={{
                      padding: 18, textAlign: 'center',
                      fontFamily: fBody, fontSize: 12, color: RED,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    }}>
                      <AlertTriangle size={20} />
                      <div style={{ wordBreak: 'break-word', lineHeight: 1.4 }}>{entry.error}</div>
                      <button
                        onClick={e => { e.stopPropagation(); retryOne(p.id_product); }}
                        style={{
                          marginTop: 4, display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', background: 'transparent', color: CREAM,
                          border: `1px solid ${HAIRLINE_STRONG}`,
                          fontFamily: fBody, fontSize: 11, cursor: 'pointer',
                        }}>
                        <RotateCw size={11} /> Reintentar
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      color: MUTED,
                    }}>
                      <Loader2 size={22} className="animate-spin" />
                      <Micro size={10}>Renderizando…</Micro>
                    </div>
                  )}
                </div>

                {/* Meta del producto */}
                <div style={{ width: cardW, textAlign: 'center' }}>
                  <div style={{
                    fontFamily: fBody, fontSize: 12, color: CREAM,
                    fontWeight: 500, lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {p.name}
                  </div>
                  <div style={{
                    fontFamily: fMono, fontSize: 10, color: FAINT,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    marginTop: 4,
                    display: 'flex', justifyContent: 'center', gap: 10,
                  }}>
                    <span>{p.brand || '—'}</span>
                    {hasOff && <span style={{ color: ACCENT }}>−{off}%</span>}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 6, width: cardW }}>
                  <button
                    onClick={() => downloadOne(p)}
                    disabled={!ready}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px 0', background: 'transparent', color: CREAM,
                      border: `1px solid ${HAIRLINE_STRONG}`,
                      cursor: ready ? 'pointer' : 'wait',
                      fontFamily: fBody, fontSize: 12, fontWeight: 500,
                      opacity: ready ? 1 : 0.55,
                    }}>
                    <Download size={13} />
                    JPG
                  </button>
                  <button
                    onClick={() => copyCaption(p.id_product)}
                    title={`Copy de Facebook · primera línea: ${fLen} caracteres`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px 0', background: 'transparent',
                      color: copiedId === p.id_product ? ACCENT : CREAM,
                      border: `1px solid ${copiedId === p.id_product ? ACCENT : HAIRLINE_STRONG}`,
                      cursor: 'pointer',
                      fontFamily: fBody, fontSize: 12, fontWeight: 500,
                      transition: 'color 200ms ease, border-color 200ms ease',
                    }}>
                    {copiedId === p.id_product ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === p.id_product ? 'Listo' : 'Copy'}
                  </button>
                </div>

                {/* Indicador hook (FB corta el caption ~125 chars antes del "Ver más") */}
                <div style={{
                  width: cardW, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', gap: 6,
                  fontFamily: fMono, fontSize: 9, letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}>
                  <span style={{ color: hookOk ? FAINT : RED }}>
                    Hook · {fLen}/{FB_FIRST_LINE_LIMIT}
                  </span>
                  <span style={{ color: FAINT }}>{p.category || ''}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: micro-tip de marketing + zoom */}
        <div style={{
          marginTop: 40, paddingTop: 20, borderTop: `1px solid ${HAIRLINE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={12} color={FAINT} />
            <Micro size={10} color={MUTED}>
              Mejor ventana en Perú · 19:00–21:00 · publica como anuncio para alcance
            </Micro>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Micro size={10}>Zoom previa</Micro>
            <input
              type="range" min="0.22" max="0.6" step="0.02"
              value={previewScale}
              onChange={e => setPreviewScale(parseFloat(e.target.value))}
              style={{ width: 160, accentColor: ACCENT }}
            />
            <Micro size={10} color={MUTED}>{Math.round(previewScale * 100)}%</Micro>
          </div>
        </div>
      </div>

      {/* ──── Lightbox: inspección 1:1 antes de descargar ──── */}
      {lightboxEntry?.blob && lightboxProduct && (
        <div
          onClick={() => setLightboxId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 70,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 32, gap: 16, cursor: 'zoom-out',
          }}
        >
          <img
            src={lightboxEntry.blobUrl}
            alt={lightboxProduct.name}
            style={{
              maxWidth: 'min(90vw, 900px)', maxHeight: '82vh',
              objectFit: 'contain',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
              border: `1px solid ${HAIRLINE_STRONG}`,
            }}
          />
          <Micro size={10} color={MUTED}>
            Clic en cualquier parte para cerrar · Esc
          </Micro>
        </div>
      )}
    </div>
  );
}
