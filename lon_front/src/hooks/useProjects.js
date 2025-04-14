import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchProjects() {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://127.0.0.1:8000/api/projects/', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des projets');
    }
    
    return response.json();
}

async function fetchProject(id) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération du projet');
    }
    
    return response.json();
}

async function createProject(data) {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch('http://127.0.0.1:8000/api/projects/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            // Log détaillé de l'erreur
            console.error('Erreur serveur:', responseData);
            
            // Construire un message d'erreur plus détaillé
            const errorMessage = responseData.detail 
                ? responseData.detail 
                : Object.entries(responseData)
                    .map(([key, value]) => `${key}: ${value.join(', ')}`)
                    .join('\n');
            
            throw new Error(errorMessage);
        }

        return responseData;
    } catch (error) {
        console.error('Erreur complète:', error);
        throw error;
    }
}

async function updateProject({ id, data }) {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Erreur serveur:', responseData);
            const errorMessage = responseData.detail 
                ? responseData.detail 
                : Object.entries(responseData)
                    .map(([key, value]) => `${key}: ${value.join(', ')}`)
                    .join('\n');
            
            throw new Error(errorMessage);
        }

        return responseData;
    } catch (error) {
        console.error('Erreur complète:', error);
        throw error;
    }
}

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects
    });
}

export function useProject(id) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du projet');
            }
            
            const data = await response.json();
            console.log('Données du projet:', data); // Pour déboguer
            return data;
        },
        enabled: !!id
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
        }
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateProject,
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
        }
    });
} 