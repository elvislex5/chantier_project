import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/api/users/');
            return response.data;
        }
    });
};