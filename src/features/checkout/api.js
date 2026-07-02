import client from '../../shared/api/client';

export const getAddresses = () =>
  client.get('/direcciones/').then(r => r.data);

export const createAddress = data =>
  client.post('/direcciones/', data).then(r => r.data);

export const getAddress = id =>
  client.get(`/direcciones/${id}/`).then(r => r.data);

export const getUbigeos = () =>
  client.get('/ubigeos/').then(r => r.data);
