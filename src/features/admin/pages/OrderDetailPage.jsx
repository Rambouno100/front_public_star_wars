import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { adminGetOrder, adminUpdateOrder } from '../api';
import { Section, TextInput, NumberInput, SelectInput, inputCls } from '../components/product-edit/ui';

const STATE_OPTIONS = [
  { value: 'draft',           label: 'Borrador' },
  { value: 'pending_payment', label: 'Pendiente de pago' },
  { value: 'paid',            label: 'Pagado' },
  { value: 'processing',      label: 'En proceso' },
  { value: 'shipped',         label: 'Enviado' },
  { value: 'delivered',       label: 'Entregado' },
  { value: 'cancelled',       label: 'Cancelado' },
];

const PAYMENT_OPTIONS = [
  { value: 'transfer', label: 'Transferencia / efectivo' },
  { value: 'card',     label: 'Tarjeta (+3.5%)' },
];

const INVOICE_OPTIONS = [
  { value: 'boleta',  label: 'Boleta' },
  { value: 'factura', label: 'Factura' },
];

const TAX_RATE = 0.18;
const CARD_SURCHARGE = 0.035;

const num = v => (v === '' || v === null || v === undefined ? 0 : parseFloat(v) || 0);

const fromOrder = o => ({
  state:          o.state ?? 'draft',
  payment_method: o.payment_method ?? 'transfer',
  invoice_type:   o.invoice_type ?? 'boleta',
  ruc:            o.ruc ?? '',
  razon_social:   o.razon_social ?? '',
  address_id:     o.address_id ?? '',
  user_id:        o.user_id ?? '',
  payment_token:  o.payment_token ?? '',
  subtotal:       o.subtotal ?? 0,
  tax:            o.tax ?? 0,
  shipping:       o.shipping ?? 0,
  total:          o.total ?? 0,
  lines: (o.lines ?? o.salesorderline_set ?? []).map(l => ({
    id:           l.id ?? l.id_salesorderline ?? null,
    product_id:   l.product_id ?? l.product ?? '',
    product_name: l.product_name ?? '',
    product_qty:  l.product_qty ?? 1,
    price_unit:   l.price_unit ?? 0,
  })),
});

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminGetOrder(id),
    staleTime: 0,
  });

  useEffect(() => { if (order) setForm(fromOrder(order)); }, [order]);

  const updateMut = useMutation({
    mutationFn: payload => adminUpdateOrder(id, payload),
    onSuccess: data => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.setQueryData(['admin-order', id], data);
      setForm(fromOrder(data));
    },
  });

  if (isLoading || !form) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-brand-faint" />
    </div>
  );

  if (error || !order) return (
    <div className="p-8 text-center text-brand-muted text-[13px]">Orden no encontrada.</div>
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setLine = (i, k, v) => setForm(f => ({
    ...f,
    lines: f.lines.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)),
  }));

  const addLine = () => setForm(f => ({
    ...f,
    lines: [...f.lines, { id: null, product_id: '', product_name: '', product_qty: 1, price_unit: 0 }],
  }));

  const removeLine = i => setForm(f => ({
    ...f,
    lines: f.lines.filter((_, idx) => idx !== i),
  }));

  // Recalcula los montos a partir de las líneas (IGV incluido en el precio unitario).
  const recalc = () => {
    let gross = form.lines.reduce((s, l) => s + num(l.price_unit) * num(l.product_qty), 0);
    if (form.payment_method === 'card') gross = +(gross * (1 + CARD_SURCHARGE)).toFixed(2);
    const ship = num(form.shipping);
    const subtotal = +(gross / (1 + TAX_RATE)).toFixed(2);
    const tax = +(gross - subtotal).toFixed(2);
    setForm(f => ({ ...f, subtotal, tax, total: +(gross + ship).toFixed(2) }));
  };

  const save = () => {
    const payload = {
      state:          form.state,
      payment_method: form.payment_method,
      invoice_type:   form.invoice_type,
      ruc:            form.invoice_type === 'factura' ? (form.ruc || null) : null,
      razon_social:   form.invoice_type === 'factura' ? (form.razon_social || null) : null,
      address_id:     form.address_id === '' ? null : parseInt(form.address_id, 10),
      user_id:        parseInt(form.user_id, 10),
      payment_token:  form.payment_token === '' ? null : form.payment_token,
      subtotal:       num(form.subtotal),
      tax:            num(form.tax),
      shipping:       num(form.shipping),
      total:          num(form.total),
      lines: form.lines
        .filter(l => l.product_id !== '' && num(l.product_qty) > 0)
        .map(l => ({
          ...(l.id ? { id: l.id } : {}),
          product_id:   parseInt(l.product_id, 10),
          product_qty:  parseInt(l.product_qty, 10),
          price_unit:   num(l.price_unit),
          product_name: l.product_name ?? '',
        })),
    };
    updateMut.mutate(payload);
  };

  const linesTotal = form.lines.reduce((s, l) => s + num(l.price_unit) * num(l.product_qty), 0);

  return (
    <div className="min-h-screen">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-brand-bg/95 backdrop-blur border-b border-brand-border">
        <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate('/admin/ordenes')}
              className="flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft size={14} />Órdenes
            </button>
            <span className="text-brand-border-md">›</span>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-faint">Detalle de orden</p>
              <h1 className="font-display text-lg font-semibold text-brand-text tracking-tight">
                #{String(id).padStart(5, '0')}
              </h1>
            </div>
          </div>

          <button onClick={save} disabled={updateMut.isPending}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold bg-brand-accent text-brand-bg hover:opacity-90 transition-opacity disabled:opacity-40">
            {updateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {updateMut.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        {updateMut.isSuccess && !updateMut.isPending && (
          <div className="px-6 md:px-8 pb-2 text-[11px] text-brand-accent">Cambios guardados.</div>
        )}
        {updateMut.error && (
          <div className="px-6 md:px-8 pb-2 text-[11px] text-brand-red">
            {updateMut.error?.response?.data?.detail ?? updateMut.error?.message ?? 'Error al guardar.'}
          </div>
        )}
      </div>

      <div className="grid gap-8 px-6 md:px-8 py-6 lg:grid-cols-[1fr_minmax(280px,34%)] max-w-6xl mx-auto">

        {/* Main column */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* Líneas */}
          <Section title="Productos" hint="Edita cantidad, precio o producto · agrega o elimina líneas">
            <div className="space-y-3">
              {form.lines.length === 0 && (
                <p className="text-[12px] text-brand-faint py-2">Sin productos. Agrega una línea.</p>
              )}
              {form.lines.map((l, i) => (
                <div key={i} className="border border-brand-border bg-brand-panel p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="col-span-2">
                        <input
                          value={l.product_name}
                          onChange={e => setLine(i, 'product_name', e.target.value)}
                          placeholder="Nombre del producto"
                          className={inputCls}
                        />
                      </div>
                      <label className="block">
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-brand-faint">ID producto</span>
                        <input type="number" min="1" value={l.product_id}
                          onChange={e => setLine(i, 'product_id', e.target.value)}
                          className={inputCls} placeholder="—" />
                      </label>
                      <label className="block">
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-brand-faint">Cantidad</span>
                        <input type="number" min="1" step="1" value={l.product_qty}
                          onChange={e => setLine(i, 'product_qty', e.target.value)}
                          className={inputCls} />
                      </label>
                      <label className="block">
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-brand-faint">Precio unit. (S/)</span>
                        <input type="number" min="0" step="0.01" value={l.price_unit}
                          onChange={e => setLine(i, 'price_unit', e.target.value)}
                          className={inputCls} />
                      </label>
                      <div className="flex items-end">
                        <p className="text-[12px] text-brand-muted">
                          Subtotal: <span className="text-brand-text font-semibold">
                            S/ {(num(l.price_unit) * num(l.product_qty)).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeLine(i)} title="Eliminar línea"
                      className="shrink-0 p-1.5 text-brand-faint hover:text-brand-red transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addLine}
              className="mt-3 flex items-center gap-1.5 px-3 py-2 text-[12px] text-brand-muted border border-brand-border-md hover:border-brand-accent hover:text-brand-accent transition-colors">
              <Plus size={14} />Agregar línea
            </button>
          </Section>

          {/* Montos */}
          <Section title="Montos" hint="Editables manualmente · usa “Recalcular” para derivar de las líneas">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <NumberInput label="Subtotal (S/)" value={form.subtotal} min="0" step="0.01"
                onChange={e => set('subtotal', e.target.value)} />
              <NumberInput label="IGV (S/)" value={form.tax} min="0" step="0.01"
                onChange={e => set('tax', e.target.value)} />
              <NumberInput label="Envío (S/)" value={form.shipping} min="0" step="0.01"
                onChange={e => set('shipping', e.target.value)} />
              <NumberInput label="Total (S/)" value={form.total} min="0" step="0.01"
                onChange={e => set('total', e.target.value)} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={recalc}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-brand-muted border border-brand-border-md hover:border-brand-accent hover:text-brand-accent transition-colors">
                <RefreshCw size={13} />Recalcular desde productos
              </button>
              <p className="text-[11px] text-brand-faint">
                Suma de líneas: <span className="text-brand-muted">S/ {linesTotal.toFixed(2)}</span>
              </p>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          <Section title="Estado y pago">
            <div className="space-y-5">
              <SelectInput label="Estado" value={form.state} options={STATE_OPTIONS}
                onChange={e => set('state', e.target.value)} />
              <SelectInput label="Método de pago" value={form.payment_method} options={PAYMENT_OPTIONS}
                onChange={e => set('payment_method', e.target.value)} />
              <TextInput label="Token de pago" value={form.payment_token}
                onChange={e => set('payment_token', e.target.value)} placeholder="—" />
            </div>
          </Section>

          <Section title="Comprobante">
            <div className="space-y-5">
              <SelectInput label="Tipo" value={form.invoice_type} options={INVOICE_OPTIONS}
                onChange={e => set('invoice_type', e.target.value)} />
              {form.invoice_type === 'factura' && (
                <>
                  <TextInput label="RUC" value={form.ruc}
                    onChange={e => set('ruc', e.target.value)} placeholder="20xxxxxxxxx" />
                  <TextInput label="Razón social" value={form.razon_social}
                    onChange={e => set('razon_social', e.target.value)} placeholder="—" />
                </>
              )}
            </div>
          </Section>

          <Section title="Cliente y entrega">
            <div className="space-y-5">
              <NumberInput label="ID usuario (propietario)" value={form.user_id} min="1"
                onChange={e => set('user_id', e.target.value)} />
              <NumberInput label="ID dirección de envío" value={form.address_id} min="1"
                onChange={e => set('address_id', e.target.value)} placeholder="Sin dirección" />
            </div>
          </Section>

          <Section title="Información">
            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-brand-faint">ID orden</span>
                <span className="font-mono text-brand-text">#{String(id).padStart(5, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-faint">Creada</span>
                <span className="text-brand-text">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'}
                </span>
              </div>
              {order.invoice_type && (
                <div className="flex justify-between">
                  <span className="text-brand-faint">Comprobante</span>
                  <span className="text-brand-text capitalize">{order.invoice_type}</span>
                </div>
              )}
              {order.ruc && (
                <div className="flex justify-between">
                  <span className="text-brand-faint">RUC</span>
                  <span className="font-mono text-brand-text">{order.ruc}</span>
                </div>
              )}
              {order.razon_social && (
                <div className="flex justify-between gap-4">
                  <span className="text-brand-faint shrink-0">Razón social</span>
                  <span className="text-brand-text text-right">{order.razon_social}</span>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
