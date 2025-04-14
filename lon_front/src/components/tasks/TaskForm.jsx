import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateTask, useUpdateTask, useTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';

function TaskForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: taskData, isLoading: isLoadingTask } = useTask(id);
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const { data: projects } = useProjects();
    const { data: users } = useUsers();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        status: 'todo',
        priority: 'medium',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        if (taskData) {
            setFormData({
                title: taskData.title || '',
                description: taskData.description || '',
                project: taskData.project?.id || '',
                assigned_to: taskData.assigned_to?.id || '',
                status: taskData.status || 'todo',
                priority: taskData.priority || 'medium',
                start_date: taskData.start_date || '',
                end_date: taskData.end_date || ''
            });
        }
    }, [taskData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                project: parseInt(formData.project),
                assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
            };

            if (id) {
                await updateTask.mutateAsync({ id, data: dataToSend });
            } else {
                await createTask.mutateAsync(dataToSend);
            }
            navigate('/tasks');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (id && isLoadingTask) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">
                {id ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Titre
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Projet
                    </label>
                    <select
                        name="project"
                        value={formData.project}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    >
                        <option value="">Sélectionner un projet</option>
                        {projects?.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Assigné à
                    </label>
                    <select
                        name="assigned_to"
                        value={formData.assigned_to}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="">Non assigné</option>
                        {users?.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Statut
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="review">En révision</option>
                            <option value="done">Terminé</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Priorité
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                            <option value="low">Basse</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="urgent">Urgente</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Date de début
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Date de fin
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/tasks')}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {id ? 'Modifier' : 'Créer'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TaskForm;