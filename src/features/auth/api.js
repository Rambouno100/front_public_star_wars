import client from '../../shared/api/client';

export const loginWithGoogle = googleIdToken =>
  client.post('/auth/google/', { googleIdToken }, { withCredentials: true }).then(r => r.data);

export const logoutUser = () =>
  client.post('/auth/logout/', {}, { withCredentials: true }).then(r => r.data);

export const getMe = () =>
  client.get('/auth/me/').then(r => r.data);
