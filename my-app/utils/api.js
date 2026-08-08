import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined' && window.location.pathname.startsWith('/Akramadmin')
        && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/Akramadmin/login';
    }
    error.friendlyMessage = error.response?.data?.message
      || (error.code === 'ECONNABORTED' ? 'انتهت مهلة الاتصال' : 'تعذّر الاتصال بالخادم');
    return Promise.reject(error);
  },
);

/** Consistent error text for toasts. */
export const errMsg = (e) => e?.friendlyMessage || e?.response?.data?.message || e?.message || 'حدث خطأ غير متوقع';

export default api;
