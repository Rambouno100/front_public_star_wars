import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ExternalLink, Loader2 } from 'lucide-react';
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminGetProduct,
} from '../api';
import ImagePanel from '../components/product-edit/ImagePanel';
import BasicSection from '../components/product-edit/BasicSection';
import PriceSection from '../components/product-edit/PriceSection';
import StatusSection from '../components/product-edit/StatusSection';
import SpecsSection from '../components/product-edit/SpecsSection';

const EMPTY = {
  name: '', description: '', category: '', brand: '',
  price: '', price_offer: '', stock: '0', is_active: true,
  approved: '', condition: '', model_name: '',
  faction: '', era: '', planet_origin: '', character_related: '',
  material: '', is_collectible: false,
};

const fromProduct = p => ({
  name: p.name ?? '', description: p.description ?? '',
  category: p.category ?? '', brand: p.brand ?? '',
  price: p.price ?? '', price_offer: p.price_offer ?? '',
  stock: p.stock ?? '0', is_active: p.is_active ?? true,
  approved: p.approved ?? '', condition: p.condition ?? '',
  model_name: p.model ?? '',
  faction: p.faction ?? '', era: p.era ?? '',
  planet_origin: p.planet_origin ?? '',
  character_related: p.character_related ?? '',
  material: p.material ?? '',
  is_collectible: !!p.is_collectible,
});

const toPayload = f => ({
  name: f.name.trim(), description: f.description,
  category: f.category, brand: f.brand,
  price: parseFloat(f.price) || 0,
  price_offer: f.price_offer ? parseFloat(f.price_offer) : null,
  stock: parseInt(f.stock) || 0, is_active: f.is_active,
  approved: f.approved || null, condition: f.condition || null,
  model_name: f.model_name,
  faction: f.faction || null, era: f.era || null,
  planet_origin: f.planet_origin || null,
  character_related: f.character_related || null,
  material: f.material || null,
  is_collectible: !!f.is_collectible,
});

export default function ProductEditPage() {
  const { id } = useParams();
  const isNew = !id || id === 'nuevo';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const { data: product } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminGetProduct(id),
    enabled: !isNew,
    staleTime: 0,
  });

  useEffect(() => {
    if (isNew) { setForm(EMPTY); return; }
    if (product) setForm(fromProduct(product));
  }, [product, isNew]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Requerido';
    if (form.price === '' || form.price === null) e.price = 'Requerido';
    else if (parseFloat(form.price) < 0) e.price = 'Debe ser ≥ 0';
    if (form.price_offer && parseFloat(form.price_offer) >= parseFloat(form.price))
      e.price_offer = 'Debe ser menor al precio lista';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createMut = useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: p => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      navigate(`/admin/productos/${p.id_product}`);
    },
  });
  const updateMut = useMutation({
    mutationFn: data => adminUpdateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-product', id] });
    },
  });

  const isPending = createMut.isPending || updateMut.isPending;
  const justSaved = updateMut.isSuccess && !updateMut.isPending;
  const serverError = createMut.error || updateMut.error;

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    isNew ? createMut.mutate(toPayload(form)) : updateMut.mutate(toPayload(form));
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-brand-bg/95 backdrop-blur border-b border-brand-border">
        <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate('/admin/productos')}
              className="flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft size={14} />Productos
            </button>
            <span className="text-brand-border-md">›</span>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-faint">
                {isNew ? 'Nuevo' : `#${id}`}
              </p>
              <h1 className="font-display text-lg font-semibold text-brand-text tracking-tight truncate">
                {isNew ? 'Nuevo producto' : (form.name || 'Editar producto')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isNew && (
              <a href={`/product/${id}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-brand-muted border border-brand-border-md hover:border-brand-text hover:text-brand-text transition-colors">
                <ExternalLink size={13} />Ver público
              </a>
            )}
            <button type="submit" form="product-edit-form" disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold bg-brand-accent text-brand-bg hover:opacity-90 transition-opacity disabled:opacity-40">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isPending ? 'Guardando…' : isNew ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
        {justSaved && (
          <div className="px-6 md:px-8 pb-2 text-[11px] text-brand-accent">Cambios guardados.</div>
        )}
        {serverError && (
          <div className="px-6 md:px-8 pb-2 text-[11px] text-brand-red">
            {serverError.message ?? 'Error al guardar.'}
          </div>
        )}
      </div>

      {/* Split: images left, form right (mirrors public detail) */}
      <form id="product-edit-form" onSubmit={handleSubmit}
        className="grid gap-8 px-6 md:px-8 py-6 lg:grid-cols-[minmax(280px,38%)_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ImagePanel productId={id} isNew={isNew} />
        </aside>

        <div className="flex flex-col gap-8 max-w-2xl">
          <BasicSection form={form} set={set} errors={errors} />
          <PriceSection form={form} set={set} errors={errors} />
          <StatusSection form={form} set={set} />
          <SpecsSection form={form} set={set} />
        </div>
      </form>
    </div>
  );
}
