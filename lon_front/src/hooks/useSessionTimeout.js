import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getTokenExpirationTime } from '../utils/tokenUtils';

export function useSessionTimeout() {
    const { refreshToken, logout } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    
    useEffect(() => {
        let warningTimeout;
        let logoutTimeout;

        const setupTimeouts = () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const expirationTime = getTokenExpirationTime(token);
            if (!expirationTime) return;

            const timeUntilExpiration = expirationTime - Date.now();
            const warningTime = 5 * 60 * 1000; // 5 minutes avant expiration

            // Définir le timeout pour l'avertissement
            warningTimeout = setTimeout(() => {
                setShowWarning(true);
            }, timeUntilExpiration - warningTime);

            // Définir le timeout pour la déconnexion
            logoutTimeout = setTimeout(() => {
                logout();
            }, timeUntilExpiration);
        };

        setupTimeouts();

        // Nettoyer les timeouts lors du démontage
        return () => {
            clearTimeout(warningTimeout);
            clearTimeout(logoutTimeout);
        };
    }, [logout]);

    const extendSession = async () => {
        try {
            await refreshToken();
            setShowWarning(false);
        } catch (error) {
            console.error('Erreur lors du renouvellement de la session:', error);
            logout();
        }
    };

    return { showWarning, extendSession };
} 