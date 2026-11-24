import axios from 'axios';
import { clearSession, getToken } from '@/utils/authStorage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Public API client (no auth)
export const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api/public`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Admin API client (with JWT)
export const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Attach token to admin requests
adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid sessions globally.
// The login endpoint is excluded so a wrong password keeps its 401 message
// on the login form instead of forcing a page reload.
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login');
      }
    }

    return Promise.reject(error);
  }
);
