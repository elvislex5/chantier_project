import { useParams, useNavigate } from 'react-router-dom';
import { useTask, useDeleteTask, useChangeTaskStatus } from '../../hooks/useTasks';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function TaskDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: task, isLoading, error } = useTask(id);
    const deleteTask = useDeleteTask();
    const changeStatus = useChangeTaskStatus();

    if (isLoading) {
        return <div className="p-4">Chargement...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Erreur: {error.message}</div>;
    }

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            try {
                await deleteTask.mutateAsync(id);
                navigate('/tasks');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await changeStatus.mutateAsync({ id, status: newStatus });
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-2xl font-bold">{task.title}</h1>
                    <div className="space-x-2">
                        <button
                            onClick={() => navigate(`/tasks/${id}/edit`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Modifier
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="font-semibold mb-2">Description</h2>
                        <p className="text-gray-600">{task.description}</p>

                        <div className="mt-4">
                            <h2 className="font-semibold mb-2">Projet</h2>
                            <p className="text-gray-600">{task.project?.name}</p>
                        </div>

                        <div className="mt-4">
                            <h2 className="font-semibold mb-2">Assigné à</h2>
                            <p className="text-gray-600">
                                {task.assigned_to?.username || 'Non assigné'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-semibold mb-2">Statut</h2>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {task.status_display}
                                </span>
                            </div>

                            <div>
                                <h2 className="font-semibold mb-2">Priorité</h2>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {task.priority_display}
                                </span>
                            </div>

                            <div>
                                <h2 className="font-semibold mb-2">Dates</h2>
                                <p className="text-gray-600">
                                    Début: {task.start_date ? format(new Date(task.start_date), 'dd MMMM yyyy', { locale: fr }) : 'Non définie'}
                                </p>
                                <p className="text-gray-600">
                                    Fin: {task.end_date ? format(new Date(task.end_date), 'dd MMMM yyyy', { locale: fr }) : 'Non définie'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 mt-6">
                    <h2 className="font-semibold mb-4">Changer le statut</h2>
                    <div className="flex gap-2">
                        {['todo', 'in_progress', 'review', 'done'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={task.status === status}
                                className={`px-4 py-2 rounded ${
                                    task.status === status
                                        ? 'bg-gray-200 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {status === 'todo' && 'À faire'}
                                {status === 'in_progress' && 'En cours'}
                                {status === 'review' && 'En révision'}
                                {status === 'done' && 'Terminé'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;