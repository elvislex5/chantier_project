import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            try {
                const response = await api.get('/api/users/');
                return response.data;
            } catch (error) {
                console.error('Erreur lors de la récupération des utilisateurs:', error);
                throw error;
            }
        },
        retry: 1,
        refetchOnWindowFocus: false
    });
} 