import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur requête : ajoute le token Supabase si disponible
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sb-access-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponse : gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helpers typés
export const documentsApi = {
  list: (params) => api.get('/api/documents', { params }),
  get: (id) => api.get(`/api/documents/${id}`),
  create: (data) => api.post('/api/documents', data),
  update: (id, data) => api.patch(`/api/documents/${id}`, data),
  delete: (id) => api.delete(`/api/documents/${id}`),
  lock: (id) => api.post(`/api/documents/${id}/lock`),
  unlock: (id) => api.delete(`/api/documents/${id}/lock`),
};

export const notificationsApi = {
  list: () => api.get('/api/notifications'),
  markRead: (id) => api.patch(`/api/notifications/${id}`, { read: true }),
  markAllRead: () => api.post('/api/notifications/read-all'),
};

export const activityApi = {
  list: (params) => api.get('/api/activity', { params }),
};

export const uploadApi = {
  upload: (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
