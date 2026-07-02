import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, ChevronDown, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminListProducts, adminDeleteProduct } from '../api';
import ProductPostExport from '../components/ProductPostExport';

const APPROVED_LABEL = { 'Price/Quality': 'Oferta Relámpago', Price: 'Mejor Precio', Quality: 'Mejor Calidad' };

const ProductsAdminPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(null); // array of product objects
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminListProducts,
  });

  const deleteMut = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => { qc.invalidateQueries(['admin-products']); setDeleting(null); },
  });

  const filtered = useMemo(() => {
    const lq = q.toLowerCase();
    return products.filter(p => !lq || p.name?.toLowerCase().includes(lq) || p.brand?.toLowerCase().includes(lq));
  }, [products, q]);

  const toggleOne = (id) => setSelected(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id_product));
  const someFilteredSelected = filtered.some(p => selected.has(p.id_product));
  const toggleAll = () => setSelected(s => {
    const n = new Set(s);
    if (allFilteredSelected) filtered.forEach(p => n.delete(p.id_product));
    else filtered.forEach(p => n.add(p.id_product));
    return n;
  });
  const clearSelection = () => setSelected(new Set());

  const openPostExport = () => {
    const list = filtered.filter(p => selected.has(p.id_product));
    if (list.length === 0) return;
    setExporting(list);
    setMenuOpen(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-faint mb-1">Administración</p>
          <h1 className="font-display text-2xl font-semibold text-brand-text tracking-tight">Productos</h1>
        </div>
        <button
          onClick={() => navigate('/admin/productos/nuevo')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-bg text-[13px] font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Nuevo producto
        </button>
      </div>

      {/* Search + selection bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-faint" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nombre o marca…"
            className="w-full bg-brand-surface border border-brand-border-md pl-9 pr-4 py-2.5 text-[13px] text-brand-text placeholder-brand-faint outline-none focus:border-brand-accent transition-colors"
          />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-accent">
              {selected.size} {selected.size === 1 ? 'seleccionado' : 'seleccionados'}
            </span>
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 px-2.5 py-2 text-[12px] text-brand-muted border border-brand-border-md hover:border-brand-text hover:text-brand-text transition-colors"
            >
              <X size={12} /> Limpiar
            </button>
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold bg-brand-accent text-brand-bg hover:opacity-90 transition-opacity"
              >
                Acciones <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[240px] bg-brand-panel border border-brand-border-md shadow-2xl">
                  <button
                    onClick={openPostExport}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[13px] text-brand-text hover:bg-brand-surface/60 transition-colors"
                  >
                    <ImageIcon size={14} className="text-brand-accent" />
                    <div>
                      <div className="font-medium">Generar post Facebook</div>
                      <div className="text-[11px] text-brand-faint mt-0.5">JPG 1080×1350 listo para publicar</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-brand-border overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface">
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  ref={el => { if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected; }}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 accent-brand-accent cursor-pointer"
                  aria-label="Seleccionar todos"
                />
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal">Producto</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal hidden md:table-cell">Categoría</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal">Precio</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal hidden lg:table-cell">Stock</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal hidden lg:table-cell">Estado</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint font-normal hidden lg:table-cell">Etiqueta</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center font-mono text-[11px] text-brand-faint tracking-widest uppercase">Cargando…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-brand-muted text-[13px]">Sin resultados</td></tr>
            ) : filtered.map(p => (
              <tr
                key={p.id_product}
                className={`border-b border-brand-border transition-colors group cursor-pointer ${selected.has(p.id_product) ? 'bg-brand-accent/5' : 'hover:bg-brand-surface/50'}`}
                onClick={() => navigate(`/admin/productos/${p.id_product}`)}
              >
                <td className="pl-4 pr-2 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(p.id_product)}
                    onChange={() => toggleOne(p.id_product)}
                    className="h-3.5 w-3.5 accent-brand-accent cursor-pointer"
                    aria-label={`Seleccionar ${p.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {(p.main_image || p.img) && (
                      <img src={p.main_image || p.img} alt="" className="h-9 w-9 object-contain bg-white/5 shrink-0 hidden sm:block" />
                    )}
                    <div>
                      <div className="font-medium text-brand-text line-clamp-1">{p.name}</div>
                      <div className="text-brand-faint text-[11px]">{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-muted hidden md:table-cell">{p.category}</td>
                <td className="px-4 py-3">
                  <div className="text-brand-text font-medium">S/ {parseFloat(p.price).toFixed(2)}</div>
                  {p.price_offer && <div className="text-brand-accent text-[11px]">S/ {parseFloat(p.price_offer).toFixed(2)}</div>}
                </td>
                <td className="px-4 py-3 text-brand-muted hidden lg:table-cell">{p.stock}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`inline-block px-2 py-0.5 font-mono text-[10px] ${p.is_active ? 'bg-brand-accent/10 text-brand-accent' : 'bg-white/5 text-brand-faint'}`}>
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {p.approved && (
                    <span className="inline-block px-2 py-0.5 font-mono text-[10px] bg-white/5 text-brand-muted">
                      {APPROVED_LABEL[p.approved] ?? p.approved}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/admin/productos/${p.id_product}`)}
                      className="p-1.5 text-brand-muted hover:text-brand-text transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleting(p)}
                      className="p-1.5 text-brand-muted hover:text-brand-red transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-[10px] text-brand-faint">{filtered.length} productos</p>

      {/* Facebook post export */}
      {exporting && (
        <ProductPostExport products={exporting} onClose={() => setExporting(null)} />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-brand-panel border border-brand-border-md p-6">
            <h3 className="font-display text-[15px] font-semibold text-brand-text mb-2">¿Desactivar producto?</h3>
            <p className="text-[13px] text-brand-muted mb-1">El producto quedará inactivo y no aparecerá en el catálogo.</p>
            <p className="text-[13px] text-brand-text font-medium mb-6 line-clamp-2">{deleting.name}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 text-[13px] text-brand-muted border border-brand-border-md hover:border-brand-text transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => deleteMut.mutate(deleting.id_product)}
                disabled={deleteMut.isPending}
                className="px-4 py-2 text-[13px] font-semibold bg-brand-red/90 text-white hover:bg-brand-red transition-colors disabled:opacity-40"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdminPage;
