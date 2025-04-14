import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Récupération des tâches d'un projet
export function useTasks(projectId) {
    return useQuery({
        queryKey: ['tasks', projectId],
        queryFn: async () => {
            const token = localStorage.getItem('access_token');
            // Utiliser le filtre par projet
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/?project=${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des tâches');
            }
            
            return response.json();
        },
        enabled: !!projectId
    });
}

// Création d'une tâche
export function useCreateTask() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (taskData) => {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Erreur lors de la création de la tâche');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
}

// Mise à jour du statut d'une tâche
export function useUpdateTaskStatus() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ taskId, status }) => {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/change_status/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du statut');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
}

// Ajout de la fonction de mise à jour
export function useUpdateTask() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ taskId, data }) => {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Erreur lors de la mise à jour de la tâche');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
}

// Ajout de la fonction de suppression
export function useDeleteTask() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (taskId) => {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de la tâche');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
        }
    });
} 