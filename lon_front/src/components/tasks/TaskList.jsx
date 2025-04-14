import { useTasks } from '../../hooks/useTasks';
import { Link } from 'react-router-dom';
import { Card, Button } from '../ui';

function TaskList() {
    const { data, isLoading, error } = useTasks();
    
    console.log('État du chargement:', isLoading);
    console.log('Données reçues:', data);
    console.log('Erreur éventuelle:', error);

    if (isLoading) {
        return <div>Chargement des tâches...</div>;
    }

    if (error) {
        return <div>Erreur : {error.message}</div>;
    }

    // Assurez-vous que data.results existe et est un tableau
    const tasks = Array.isArray(data) ? data : (data?.results || []);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tâches</h1>
                <Button as={Link} to="/tasks/new" variant="primary">
                    Nouvelle Tâche
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map(task => (
                    <Card key={task.id}>
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <p className="text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                        <div className="mt-4 space-y-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                                task.status === 'done' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {task.status_display}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded text-sm ${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {task.priority_display}
                            </span>
                        </div>
                        <Button as={Link} to={`/tasks/${task.id}`} variant="link" className="mt-4">
                            Voir les détails →
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default TaskList;