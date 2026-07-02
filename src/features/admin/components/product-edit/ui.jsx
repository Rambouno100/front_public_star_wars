import React from 'react';

export const inputCls =
  "w-full bg-transparent border-b border-brand-border-md py-2 text-[13px] text-brand-text placeholder-brand-faint outline-none focus:border-brand-accent transition-colors";

export const Label = ({ children }) => (
  <label className="block mb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-brand-faint">{children}</label>
);

export const Field = ({ label, error, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
    {error && <p className="mt-1 text-[11px] text-brand-red">{error}</p>}
  </div>
);

export const TextInput = ({ label, error, ...p }) => (
  <Field label={label} error={error}><input {...p} className={inputCls} /></Field>
);

export const NumberInput = ({ label, error, ...p }) => (
  <Field label={label} error={error}><input type="number" {...p} className={inputCls} /></Field>
);

export const SelectInput = ({ label, options, ...p }) => (
  <Field label={label}>
    <select {...p} className={`${inputCls} bg-brand-panel appearance-none cursor-pointer`}>
      {options.map(o => <option key={o.value} value={o.value} className="bg-brand-panel">{o.label}</option>)}
    </select>
  </Field>
);

export const Textarea = ({ label, ...p }) => (
  <Field label={label}>
    <textarea {...p} className={`${inputCls} resize-none`} />
  </Field>
);

export const Section = ({ title, hint, children }) => (
  <section className="border-t border-brand-border pt-6">
    <div className="flex items-baseline justify-between mb-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand-faint">{title}</p>
      {hint && <p className="text-[10px] text-brand-faint">{hint}</p>}
    </div>
    {children}
  </section>
);

export const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3">
    <button type="button" onClick={() => onChange(!checked)}
      className={`flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-brand-accent' : 'bg-brand-border-md'}`}>
      <span className={`mx-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
    <span className="text-[13px] text-brand-muted">{label}</span>
  </div>
);
