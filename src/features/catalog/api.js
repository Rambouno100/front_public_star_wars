import client from '../../shared/api/client';

export const getProducts = ({ cursor, limit = 20, q, purpose, flashOnly, faction, era, collectibleOnly } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  if (q) params.q = q;
  if (purpose) params.purpose = purpose;
  if (flashOnly) params.flash_only = true;
  if (faction) params.faction = faction;
  if (era) params.era = era;
  if (collectibleOnly) params.collectible_only = true;
  return client.get('/products/', { params }).then(r => {
    const data = r.data;
    if (Array.isArray(data)) return { items: data, next_cursor: null };
    return {
      items: data.items ?? data.results ?? [],
      next_cursor: data.next_cursor ?? null,
    };
  });
};

export const getProduct = id =>
  client.get(`/products/${id}/`).then(r => r.data);
