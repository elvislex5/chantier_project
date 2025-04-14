import api from './api';

export const tasksApi = {
    getAll: async () => {
        const response = await api.get('/api/tasks/');
        console.log('Réponse getAll:', response.data);
        return response;
    },
    getById: (id) => api.get(`/api/tasks/${id}/`),
    create: async (data) => {
        const response = await api.post('/api/tasks/', data);
        console.log('Réponse create:', response.data);
        return response;
    },
    update: (id, data) => api.put(`/api/tasks/${id}/`, data),
    delete: (id) => api.delete(`/api/tasks/${id}/`),
    changeStatus: (id, status) => api.post(`/api/tasks/${id}/change_status/`, { status })
};