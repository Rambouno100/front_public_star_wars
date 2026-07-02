import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Star, Trash2, Upload, ImageOff } from 'lucide-react';
import {
  adminGetProduct, adminUploadImage, adminDeleteImage,
  adminSetPrimaryImage, adminReorderImages,
} from '../../api';

const Placeholder = () => (
  <div className="flex h-full w-full items-center justify-center bg-brand-panel text-brand-faint">
    <ImageOff size={28} />
  </div>
);

export default function ImagePanel({ productId, isNew }) {
  const fileRef = useRef();
  const dragId = useRef(null);
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [hero, setHero] = useState(0);
  const [dragOver, setDragOver] = useState(null);

  const { data: product } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: () => adminGetProduct(productId),
    enabled: !isNew,
    staleTime: 0,
  });

  const images = [...(product?.images ?? [])].sort((a, b) => a.order - b.order);
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-product', productId] });

  const upload = async (files) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      try { await adminUploadImage(productId, file); } catch (e) { console.error(e); }
    }
    await refresh();
    setUploading(false);
  };

  const onDrop = async (e, targetId) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragId.current || dragId.current === targetId) return;
    const order = images.map(i => i.id);
    const from = order.indexOf(dragId.current);
    const to = order.indexOf(targetId);
    order.splice(from, 1);
    order.splice(to, 0, dragId.current);
    dragId.current = null;
    await adminReorderImages(productId, order);
    refresh();
  };

  const main = images[hero] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square w-full bg-white/5 border border-brand-border overflow-hidden">
        {main ? <img src={main.url} alt="" className="h-full w-full object-contain" /> : <Placeholder />}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <div key={img.id}
              draggable
              onClick={() => setHero(idx)}
              onDragStart={() => { dragId.current = img.id; }}
              onDragOver={e => { e.preventDefault(); setDragOver(img.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => onDrop(e, img.id)}
              className={`relative group cursor-grab border transition-all ${
                dragOver === img.id ? 'border-brand-accent scale-105'
                  : idx === hero ? 'border-brand-accent' : 'border-brand-border'
              }`}
              style={{ width: 64, height: 64 }}>
              <img src={img.url} alt="" className="h-full w-full object-contain bg-white/5" />
              {idx === 0 && (
                <div className="absolute top-0.5 left-0.5 bg-brand-accent rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  <Star size={7} fill="currentColor" className="text-brand-bg" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {idx !== 0 && (
                  <button type="button" title="Hacer principal"
                    onClick={async e => { e.stopPropagation(); await adminSetPrimaryImage(img.id); refresh(); }}
                    className="text-brand-accent hover:opacity-80"><Star size={12} /></button>
                )}
                <button type="button" title="Eliminar"
                  onClick={async e => { e.stopPropagation(); await adminDeleteImage(img.id); refresh(); }}
                  className="text-brand-red hover:opacity-80"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={e => upload(e.target.files)} disabled={isNew} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || isNew}
          className="flex items-center gap-2 px-4 py-2 border border-brand-border-md text-[12px] text-brand-muted hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-40">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Subiendo…' : 'Subir imágenes'}
        </button>
        <p className="mt-1 text-[10px] text-brand-faint">
          {isNew ? 'Guarda el producto primero.' : 'Arrastra para ordenar · primera = principal · máx 8 MB'}
        </p>
      </div>
    </div>
  );
}
