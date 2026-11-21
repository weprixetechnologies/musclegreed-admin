import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5672/api`;
  }
  return 'http://localhost:5672/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getAccessToken = () => null;
let refreshTokensHandler = async () => null;
let logoutHandler = () => { };

export function setupApiInterceptors(tokenGetter, refreshFn, logoutFn) {
  getAccessToken = tokenGetter;
  refreshTokensHandler = refreshFn;
  logoutHandler = logoutFn;
}

// Request interceptor: dynamic host adaptation & attach access token
api.interceptors.request.use(
  (config) => {
    // Automatically keep API baseURL aligned with browser origin host (e.g. localhost or LAN IP)
    // to prevent cross-site cookie blocking on HTTP
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL && window.location.hostname) {
      config.baseURL = `http://${window.location.hostname}:5672/api`;
    }
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on login, refresh-token, or logout endpoints
    const isAuthEndpoint =
      originalRequest?.url?.includes('/admin/login') ||
      originalRequest?.url?.includes('/admin/refresh-token') ||
      originalRequest?.url?.includes('/admin/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokensHandler();
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          processQueue(new Error('Session refresh failed'), null);
          logoutHandler();
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        logoutHandler();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
