import client from '../../shared/api/client';

export const getCurrentCart = () =>
  client.get('/current-cart/').then(r => r.data);

export const addToCart = ({ productId, quantity = 1 }) =>
  client.post('/add-to-cart/', { product_id: productId, quantity }).then(r => r.data);

export const updateCartLine = ({ lineId, data }) =>
  client.put(`/cart/lines/${lineId}/`, data).then(r => r.data);

export const deleteCartLine = lineId =>
  client.delete(`/cart/lines/${lineId}/`).then(r => r.data);

export const createSalesOrder = data =>
  client.post('/sales-orders/', data).then(r => r.data);

export const updateSalesOrder = (id, data) =>
  client.put(`/sales-orders/${id}/`, data).then(r => r.data);

export const addOrderLine = (orderId, data) =>
  client.post(`/sales-orders/${orderId}/lines/`, data).then(r => r.data);
