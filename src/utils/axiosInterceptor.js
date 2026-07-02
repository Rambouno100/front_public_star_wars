import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const setupInterceptors = (logout) => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token found, logging out');
          logout();
          return Promise.reject(error);
        }

        console.log('Attempting to refresh token');

        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/token/refresh/`, {
            refresh: refreshToken
          });

          console.log('Refresh response:', response.data);

          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + access;
          originalRequest.headers['Authorization'] = 'Bearer ' + access;
          
          processQueue(null, access);
          return axios(originalRequest);
        } catch (err) {
          console.error('Error refreshing token:', err);
          processQueue(err, null);
          logout();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;