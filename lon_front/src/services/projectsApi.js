import api from './api';

export const projectsApi = {
    getAll: () => api.get('/api/projects/'),
    getById: (id) => api.get(`/api/projects/${id}/`),
    create: (data) => api.post('/api/projects/', data),
    update: (id, data) => api.put(`/api/projects/${id}/`, data),
    delete: (id) => api.delete(`/api/projects/${id}/`)
};