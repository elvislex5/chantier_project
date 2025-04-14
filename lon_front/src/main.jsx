import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme.js';
import axios from 'axios';
import { AuthProvider } from './hooks/useAuth';

// Configuration de l'URL de base pour axios
axios.defaults.baseURL = 'http://localhost:8000';

// Ajouter un intercepteur pour inclure le token dans toutes les requêtes
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (token expiré)
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      // Si le token est expiré, essayer de le rafraîchir
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/token/refresh/', { refresh: refreshToken });
          localStorage.setItem('token', response.data.access);
          
          // Réessayer la requête originale avec le nouveau token
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue, déconnecter l'utilisateur
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        // Si pas de refresh token, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
