import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // needed for HttpOnly refresh cookie
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const PUBLIC_URLS = ['/auth/google/', '/auth/refresh/', '/products/'];

client.interceptors.request.use(config => {
  const isPublic = PUBLIC_URLS.some(u => config.url?.includes(u));
  if (!isPublic) {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    const isAuthEndpoint = original.url?.includes('/auth/');
    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        original.headers['Authorization'] = 'Bearer ' + token;
        return client(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/refresh/`,
        {},
        { withCredentials: true }
      );
      localStorage.setItem('accessToken', data.access);
      client.defaults.headers.common['Authorization'] = 'Bearer ' + data.access;
      original.headers['Authorization'] = 'Bearer ' + data.access;
      processQueue(null, data.access);
      return client(original);
    } catch (err) {
      processQueue(err);
      localStorage.removeItem('accessToken');
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
