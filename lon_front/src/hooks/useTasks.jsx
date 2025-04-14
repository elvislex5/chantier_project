import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../services/tasksApi';

// Hook pour récupérer toutes les tâches
export const useTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await tasksApi.getAll();
            console.log('Réponse API tasks:', response.data);
            return response.data;
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });
};

// Hook pour récupérer une tâche spécifique
export const useTask = (id) => {
    return useQuery({
        queryKey: ['task', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await tasksApi.getById(id);
            console.log('Données de la tâche récupérées:', response.data);
            return response.data;
        },
        enabled: !!id
    });
};

// Hook pour créer une tâche
export const useCreateTask = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: tasksApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
};

// Hook pour mettre à jour une tâche
export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }) => tasksApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
};

// Hook pour supprimer une tâche
export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: tasksApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
};

// Hook pour changer le statut d'une tâche
export const useChangeTaskStatus = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, status }) => tasksApi.changeStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
};