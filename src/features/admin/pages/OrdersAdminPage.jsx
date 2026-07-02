import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminListOrders } from '../api';

const STATE_LABELS = {
  draft:           { label: 'Borrador',       color: 'text-brand-faint  bg-white/5' },
  pending_payment: { label: 'Pend. pago',     color: 'text-yellow-400   bg-yellow-400/10' },
  paid:            { label: 'Pagado',          color: 'text-brand-accent bg-brand-accent/10' },
  processing:      { label: 'En proceso',      color: 'text-blue-400     bg-blue-400/10' },
  shipped:         { label: 'Enviado',         color: 'text-purple-400   bg-purple-400/10' },
  delivered:       { label: 'Entregado',       color: 'text-brand-accent bg-brand-accent/10' },
  cancelled:       { label: 'Cancelado',       color: 'text-brand-red    bg-brand-red/10' },
};

const FILTERS = [
  { value: '',                label: 'Todos' },
  { value: 'pending_payment', label: 'Pend. pago' },
  { value: 'paid',            label: 'Pagado' },
  { value: 'processing',      label: 'En proceso' },
  { value: 'shipped',         label: 'Enviado' },
  { value: 'delivered',       label: 'Entregado' },
  { value: 'cancelled',       label: 'Cancelado' },
];

const StateBadge = ({ state }) => {
  const s = STATE_LABELS[state] ?? { label: state, color: 'text-brand-faint bg-white/5' };
  return (
    <span className={`inline-block px-2 py-0.5 font-mono text-[10px] rounded-sm ${s.color}`}>{s.label}</span>
  );
};

const OrdersAdminPage = () => {
  const navigate = useNavigate();
  const [stateFilter, setStateFilter] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', stateFilter],
    queryFn: () => adminListOrders(stateFilter),
  });

  const go = id => navigate(`/admin/ordenes/${id}`);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-faint mb-1">Administración</p>
        <h1 className="font-display text-2xl font-semibold text-brand-text tracking-tight">Órdenes</h1>
      </div>

      {/* State filter chips */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStateFilter(f.value)}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors ${
              stateFilter === f.value
                ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
                : 'border-brand-border-md text-brand-faint hover:border-brand-text hover:text-brand-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-brand-border overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface">
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal">#</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal hidden md:table-cell">Fecha</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal">Estado</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal hidden sm:table-cell">Ítems</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal">Total</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center font-mono text-[11px] text-brand-faint tracking-widest uppercase">Cargando…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-brand-muted text-[13px]">Sin resultados</td></tr>
            ) : orders.map(o => {
              const id = o.id ?? o.id_salesorder;
              return (
                <tr
                  key={id}
                  onClick={() => go(id)}
                  className="border-b border-brand-border hover:bg-brand-surface/50 transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-brand-muted text-[12px]">
                    #{String(id).padStart(5, '0')}
                  </td>
                  <td className="px-4 py-3 text-brand-muted hidden md:table-cell text-[12px]">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StateBadge state={o.state} />
                  </td>
                  <td className="px-4 py-3 text-brand-muted hidden sm:table-cell text-[12px]">
                    {(o.lines ?? o.salesorderline_set ?? []).length}
                  </td>
                  <td className="px-4 py-3 text-brand-text font-medium">
                    S/ {parseFloat(o.total ?? o.amount_total ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Eye size={13} className="text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-[10px] text-brand-faint">{orders.length} órdenes</p>
    </div>
  );
};

export default OrdersAdminPage;
