import React from 'react';
import { Section, TextInput } from './ui';

const FIELDS = [
  ['faction',           'Facción',           'Imperio / Rebelión / Jedi / Sith…'],
  ['era',               'Era',               'República / Imperio Galáctico / Nueva República…'],
  ['planet_origin',     'Planeta de origen', 'Tatooine / Coruscant / Naboo…'],
  ['character_related', 'Personaje',         'Darth Vader / Luke Skywalker / Yoda…'],
  ['material',          'Material',          'Resina / metal die-cast / vinilo…'],
  ['condition',         'Condición',         'Nuevo / Edición limitada / Vintage…'],
  ['model_name',        'Modelo / SKU',      'Black Series 6" / Hot Toys MMS…'],
];

export default function SpecsSection({ form, set }) {
  return (
    <Section title="Detalles Star Wars">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {FIELDS.map(([key, label, ph]) => (
          <TextInput key={key} label={label} placeholder={ph}
            value={form[key]} onChange={e => set(key, e.target.value)} />
        ))}

        <label className="flex items-center gap-3 mt-2 col-span-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!form.is_collectible}
            onChange={e => set('is_collectible', e.target.checked)}
            className="w-4 h-4 accent-[#A3FF7C]"
          />
          <span className="text-sm text-gray-300">
            Marcar como pieza coleccionable / edición limitada
          </span>
        </label>
      </div>
    </Section>
  );
}
