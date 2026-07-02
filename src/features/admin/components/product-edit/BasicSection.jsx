import React from 'react';
import { Section, TextInput, Textarea } from './ui';

export default function BasicSection({ form, set, errors }) {
  return (
    <Section title="Identidad">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <div className="col-span-2">
          <TextInput label="Nombre *" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Black Series Darth Vader 6&quot;…" error={errors.name} />
        </div>
        <TextInput label="Marca" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Hasbro, Hot Toys, LEGO…" />
        <TextInput label="Categoría" value={form.category} onChange={e => set('category', e.target.value)} placeholder="Figura, Sable, Casco, LEGO…" />
        <div className="col-span-2">
          <Textarea label="Descripción" rows={4} value={form.description}
            onChange={e => set('description', e.target.value)} placeholder="Descripción…" />
        </div>
      </div>
    </Section>
  );
}
