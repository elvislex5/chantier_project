import React, { useState, useContext, createContext } from 'react';
import api from '../services/api';

// Créer le contexte et l'exporter
export const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
    return useContext(AuthContext);
};

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fonction de connexion
    const login = async (credentials) => {
        try {
            setError(null);
            const response = await api.post('/api/auth/login/', credentials);
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion');
            throw err;
        }
    };
    
    // Fonction de déconnexion
    const logout = async () => {
        try {
            await api.post('/api/auth/logout/');
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };
    
    // Vérifier si l'utilisateur est déjà connecté au chargement
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const storedUser = localStorage.getItem('user');
                
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    
                    // Vérifier la validité du token
                    try {
                        await api.get('/api/auth/user/');
                    } catch (err) {
                        // Si le token est invalide, déconnecter l'utilisateur
                        if (err.response?.status === 401) {
                            logout();
                        }
                    }
                }
            } catch (err) {
                console.error('Erreur lors de la vérification de l\'authentification:', err);
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, []);
    
    // Valeur du contexte
    const value = {
        user,
        login,
        logout,
        loading,
        error
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 