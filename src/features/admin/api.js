import client from '../../shared/api/client';

/* ── Products ──────────────────────────────────────────────────── */
export const adminListProducts = () =>
  client.get('/admin/products/').then(r => r.data);

export const adminCreateProduct = data =>
  client.post('/admin/products/', data).then(r => r.data);

export const adminUpdateProduct = (id, data) =>
  client.put(`/admin/products/${id}/`, data).then(r => r.data);

export const adminDeleteProduct = id =>
  client.delete(`/admin/products/${id}/`).then(r => r.data);

/* ── Images ────────────────────────────────────────────────────── */
export const adminUploadImage = (productId, file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post(`/admin/products/${productId}/images/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const adminDeleteImage = id =>
  client.delete(`/admin/images/${id}/`);

export const adminSetPrimaryImage = id =>
  client.patch(`/admin/images/${id}/`, { is_primary: true }).then(r => r.data);

export const adminGetProduct = id =>
  client.get(`/admin/products/${id}/`).then(r => r.data);

export const adminReorderImages = (productId, imageIds) =>
  client.post(`/admin/products/${productId}/images/reorder/`, { image_ids: imageIds }).then(r => r.data);

export const adminGetProductPostImage = (productId) =>
  client.get(`/admin/products/${productId}/post-image.jpg`, { responseType: 'blob' })
    .then(r => r.data);

/* ── Orders ────────────────────────────────────────────────────── */
export const adminListOrders = (state) =>
  client.get('/admin/orders/', { params: state ? { state } : {} }).then(r => r.data);

export const adminUpdateOrderState = (id, state) =>
  client.patch(`/admin/orders/${id}/`, { state }).then(r => r.data);

// Edición total de la orden (estado, pago, dirección, propietario, montos, líneas).
export const adminUpdateOrder = (id, data) =>
  client.put(`/admin/orders/${id}/`, data).then(r => r.data);

export const adminGetOrder = id =>
  client.get(`/admin/orders/${id}/`).then(r => r.data);

/* ── AI Assistant ──────────────────────────────────────────────── */
export const adminAiInfo = () =>
  client.get('/admin/ai/info').then(r => r.data);

export const adminAiReply = ({ messages }) =>
  client.post('/admin/ai/reply', { messages }).then(r => r.data);
