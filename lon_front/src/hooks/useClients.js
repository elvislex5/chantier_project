import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            try {
                const response = await api.get('/api/clients/');
                return response.data;
            } catch (error) {
                console.error('Erreur lors de la récupération des clients:', error);
                throw error;
            }
        },
        retry: 1,
        refetchOnWindowFocus: false
    });
} 