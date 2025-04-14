import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useDeleteProject } from '../../hooks/useProjects';

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: project, isLoading } = useProject(id);
    const deleteProject = useDeleteProject();

    if (isLoading) return <div>Chargement...</div>;
    if (!project) return <div>Projet non trouvé</div>;

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            await deleteProject.mutateAsync(id);
            navigate('/projects');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <div className="space-x-2">
                        <button
                            onClick={() => navigate(`/projects/${id}/edit`)}
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

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">Statut</h3>
                        <p className="text-gray-600">{project.status_display}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Budget</h3>
                        <p className="text-gray-600">{project.budget} €</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Date de début</h3>
                        <p className="text-gray-600">{project.start_date}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Date de fin prévue</h3>
                        <p className="text-gray-600">{project.end_date}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-gray-600">{project.description}</p>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold">Progression</h3>
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                            ></div>
                        </div>
                        <span className="text-sm text-gray-600">{project.progress}% complété</span>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold">Statistiques des tâches</h3>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold">{project.task_statistics.total}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold">{project.task_statistics.in_progress}</div>
                            <div className="text-sm text-gray-600">En cours</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="font-bold">{project.task_statistics.review}</div>
                            <div className="text-sm text-gray-600">En révision</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold">{project.task_statistics.done}</div>
                            <div className="text-sm text-gray-600">Terminées</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;