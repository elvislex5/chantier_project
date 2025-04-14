import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Débogage - afficher les requêtes
    console.log('API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
    });
    
    return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => {
        // Débogage - afficher les réponses
        console.log('API Response:', {
            status: response.status,
            data: response.data
        });
        
        return response;
    },
    async (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config
        });
        
        // Afficher les détails de l'erreur dans la console pour le débogage
        if (error.response && error.response.data) {
            console.error('Détails de l\'erreur:', error.response.data);
        }
        
        const originalRequest = error.config;

        // Si l'erreur est 401 et qu'on n'a pas déjà essayé de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Si pas de refresh token, déconnecter l'utilisateur
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
                
                const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                    refresh: refreshToken
                });
                
                localStorage.setItem('token', response.data.access);
                
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Si le refresh échoue, déconnecter l'utilisateur
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;