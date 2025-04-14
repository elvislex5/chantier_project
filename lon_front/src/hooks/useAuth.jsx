import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Créer un contexte pour l'authentification
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

// Fournisseur d'authentification qui enveloppe l'application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('token') ? { username: 'Utilisateur' } : null);
  const [loading, setLoading] = useState(false);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log("Tentative de connexion avec:", credentials.username);
      
      const response = await axios.post('/api/token/', credentials);
      console.log("Réponse de l'API token:", response.data);
      
      const { access, refresh } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      console.log("Token stocké, définition de l'utilisateur");
      setUser({ username: credentials.username });
      setLoading(false);
      
      console.log("Connexion réussie");
      return true;
    } catch (error) {
      console.error('Erreur de connexion détaillée:', error.response || error);
      setLoading(false);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};