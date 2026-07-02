import client from '../../shared/api/client';

export const getPullDetail = id =>
  client.get(`/pulls-detail/${id}/`).then(r => r.data);
