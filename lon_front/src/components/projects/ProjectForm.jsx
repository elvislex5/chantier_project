import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProject, useUpdateProject, useProject } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';

function ProjectForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: existingProject } = useProject(id);
    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    
    const { data: users, isLoading: loadingUsers, error: usersError } = useUsers();


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        status: 'planning',
        budget: '',
        team_members: []
    });

    useEffect(() => {
        if (existingProject) {
            setFormData({
                name: existingProject.name,
                description: existingProject.description,
                location: existingProject.location,
                start_date: existingProject.start_date,
                end_date: existingProject.end_date,
                status: existingProject.status,
                budget: existingProject.budget,
                team_members: existingProject.team_members.map(member => member.id)
            });
        }
    }, [existingProject]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Formatage des données avant envoi
            const formattedData = {
                ...formData,
                budget: parseFloat(formData.budget) || 0,  // Conversion en nombre
                team_members: formData.team_members || [],  // S'assurer que c'est un tableau
            };
    
            console.log('Données envoyées:', formattedData);  // Log pour déboguer
    
            if (id) {
                await updateProject.mutateAsync({ id, data: formattedData });
            } else {
                await createProject.mutateAsync(formattedData);
            }
            navigate('/projects');
        } catch (error) {
            console.error('Erreur détaillée:', error.response?.data);  // Log de l'erreur détaillée
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

    return (
        <div className="max-w-2xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Nom du projet
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
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
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Lieu
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
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
                            required
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
                            required
                        />
                    </div>
                </div>

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
                        <option value="planning">En planification</option>
                        <option value="in_progress">En cours</option>
                        <option value="on_hold">En pause</option>
                        <option value="completed">Terminé</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Budget
                    </label>
                    <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Membres de l'équipe
                    </label>
                    <select
                        multiple
                        name="team_members"
                        value={formData.team_members}
                        onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                            setFormData(prev => ({
                                ...prev,
                                team_members: selectedOptions
                            }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        {users?.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                        Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs membres
                    </p>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
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

export default ProjectForm;