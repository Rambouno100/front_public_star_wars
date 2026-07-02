import client from '../../shared/api/client';

export const getOrders = ({ page = 1, state } = {}) => {
  const params = { page };
  if (state) params.state = state;
  return client.get('/sales-orders/', { params }).then(r => r.data);
};

export const getOrder = id =>
  client.get(`/sales-orders/${id}/`).then(r => r.data);
