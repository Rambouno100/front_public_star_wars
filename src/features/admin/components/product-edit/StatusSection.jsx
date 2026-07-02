import React from 'react';
import { Section, NumberInput, SelectInput, Toggle } from './ui';

const APPROVED_OPTS = [
  { value: '',              label: '— Sin etiqueta —' },
  { value: 'Price/Quality', label: 'Oferta Relámpago' },
  { value: 'Price',         label: 'Mejor Precio' },
  { value: 'Quality',       label: 'Mejor Calidad' },
];

export default function StatusSection({ form, set }) {
  return (
    <Section title="Estado y visibilidad">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <NumberInput label="Stock" value={form.stock} onChange={e => set('stock', e.target.value)} min="0" step="1" />
        <SelectInput label="Etiqueta destacada" value={form.approved}
          onChange={e => set('approved', e.target.value)} options={APPROVED_OPTS} />
        <div className="col-span-2 pt-1">
          <Toggle checked={!!form.is_active} onChange={v => set('is_active', v)} label="Producto activo" />
        </div>
      </div>
    </Section>
  );
}
