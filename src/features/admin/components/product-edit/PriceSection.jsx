import React from 'react';
import { Section, NumberInput } from './ui';

const SURCHARGE = 0.035;
const fmt = n => parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 0 });

export default function PriceSection({ form, set, errors }) {
  const list  = parseFloat(form.price) || 0;
  const offer = parseFloat(form.price_offer) || 0;
  const card  = offer ? +(offer * (1 + SURCHARGE)).toFixed(2) : 0;
  const main  = offer || list;
  const showStrike = offer && list > offer;
  const pct = showStrike ? Math.round((1 - offer / list) * 100) : 0;

  return (
    <Section title="Precios" hint="La oferta es el precio efectivo/transferencia (lo que ve grande el cliente)">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <NumberInput
          label="Precio lista (PVPR) *"
          value={form.price}
          onChange={e => set('price', e.target.value)}
          placeholder="2999" min="0" step="0.01"
          error={errors.price}
        />
        <NumberInput
          label="Precio oferta (efectivo / transferencia)"
          value={form.price_offer}
          onChange={e => set('price_offer', e.target.value)}
          placeholder="2700" min="0" step="0.01"
          error={errors.price_offer}
        />

        {/* Preview: cómo se ve en el público */}
        <div className="col-span-2 border border-brand-border bg-brand-panel px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand-faint mb-2">
            Preview público
          </p>
          {main > 0 ? (
            <div className="flex items-baseline gap-3 flex-wrap">
              {pct > 0 && <span className="text-brand-red text-[13px] font-semibold">-{pct}%</span>}
              <span className="text-brand-text text-[22px] font-display font-medium leading-none">
                S/ {fmt(main)}
              </span>
              {showStrike && (
                <span className="text-brand-faint text-[12px] line-through">S/ {fmt(list)}</span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-brand-faint">Ingresa un precio.</p>
          )}
          {offer > 0 && (
            <p className="mt-2 text-[11px] text-brand-muted">
              · Con tarjeta (auto +3.5%): <strong className="text-brand-text">S/ {fmt(card)}</strong>
            </p>
          )}
          {!offer && list > 0 && (
            <p className="mt-2 text-[11px] text-brand-faint">
              · Sin oferta: no aparece tachado ni recargo de tarjeta calculado
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
