import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../services/projectsApi';

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            try {
                console.log('Fetching projects...');
                const response = await projectsApi.getAll();
                console.log('Projects response:', response);
                return response.data;
            } catch (error) {
                console.error('Error fetching projects:', error);
                throw error;
            }
        },
        retry: 1,
        refetchOnWindowFocus: false
    });
};

export const useProject = (projectId) => {
    return useQuery({
        queryKey: ['projects', projectId],
        queryFn: async () => {
            const response = await projectsApi.getById(projectId);
            return response.data;
        },
        enabled: !!projectId
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (projectData) => {
            const response = await projectsApi.create(projectData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
        }
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await projectsApi.update(id, data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['projects']);
            queryClient.invalidateQueries(['projects', data.id]);
        }
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id) => {
            await projectsApi.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
        }
    });
};