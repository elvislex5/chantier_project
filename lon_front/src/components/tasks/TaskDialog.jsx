import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import api from '../../services/api';

function TaskDialog({ open, onClose, task, projectId, initialDate }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        start_date: '',
        end_date: '',
        assigned_to: '',
        project: ''
    });
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [fetchingProjects, setFetchingProjects] = useState(false);

    // Charger les données de la tâche si elle existe
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                start_date: task.start_date || '',
                end_date: task.end_date || '',
                assigned_to: task.assigned_to?.id || '',
                project: task.project?.id || ''
            });
        } else {
            // Réinitialiser le formulaire pour une nouvelle tâche
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                start_date: initialDate ? formatDate(initialDate) : '',
                end_date: '',
                assigned_to: '',
                project: projectId || ''
            });
        }
    }, [task, initialDate, open, projectId]);

    // Charger les utilisateurs et les projets quand le dialogue s'ouvre
    useEffect(() => {
        if (open) {
            fetchUsers();
            fetchProjects();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            setFetchingUsers(true);
            const response = await api.get('/api/users/');
            setUsers(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des utilisateurs:', err);
        } finally {
            setFetchingUsers(false);
        }
    };

    // Fonction pour récupérer les projets
    const fetchProjects = async () => {
        try {
            setFetchingProjects(true);
            const response = await api.get('/api/projects/');
            setProjects(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des projets:', err);
        } finally {
            setFetchingProjects(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validation de base
            if (!formData.title.trim()) {
                setError('Le titre est requis');
                setLoading(false);
                return;
            }

            // Préparer les données à envoyer
            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                start_date: formData.start_date,
                end_date: formData.end_date,
                project_id: formData.project || null,
                assigned_to_id: formData.assigned_to || null
            };

            console.log('Données envoyées:', taskData); // Pour déboguer

            let response;
            if (task) {
                // Mise à jour d'une tâche existante
                response = await api.put(`/api/tasks/${task.id}/`, taskData);
            } else {
                // Création d'une nouvelle tâche
                response = await api.post('/api/tasks/', taskData);
            }

            setLoading(false);
            onClose(response.data); // Fermer le dialogue et retourner les données de la tâche
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement de la tâche:', err);
            // Afficher les détails de l'erreur pour le débogage
            if (err.response && err.response.data) {
                console.error('Détails de l\'erreur:', err.response.data);
                // Afficher un message d'erreur plus spécifique si disponible
                if (typeof err.response.data === 'object') {
                    const errorMessages = Object.entries(err.response.data)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    setError(`Erreur: ${errorMessages}`);
                } else {
                    setError('Une erreur est survenue lors de l\'enregistrement de la tâche');
                }
            } else {
                setError('Une erreur est survenue lors de l\'enregistrement de la tâche');
            }
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
            <DialogTitle>{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            name="title"
                            label="Titre"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Projet</InputLabel>
                            <Select
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                label="Projet"
                                disabled={fetchingProjects}
                            >
                                <MenuItem value="">Aucun projet</MenuItem>
                                {projects.map(project => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fetchingProjects && <FormHelperText>Chargement des projets...</FormHelperText>}
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Statut</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Statut"
                            >
                                <MenuItem value="todo">À faire</MenuItem>
                                <MenuItem value="in_progress">En cours</MenuItem>
                                <MenuItem value="review">En révision</MenuItem>
                                <MenuItem value="done">Terminée</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Priorité</InputLabel>
                            <Select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                label="Priorité"
                            >
                                <MenuItem value="low">Basse</MenuItem>
                                <MenuItem value="medium">Moyenne</MenuItem>
                                <MenuItem value="high">Haute</MenuItem>
                                <MenuItem value="urgent">Urgente</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="start_date"
                            label="Date de début"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CalendarIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="end_date"
                            label="Date d'échéance"
                            type="date"
                            value={formData.end_date}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CalendarIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Assigné à</InputLabel>
                            <Select
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                label="Assigné à"
                                disabled={fetchingUsers}
                            >
                                <MenuItem value="">Non assigné</MenuItem>
                                {users.map(user => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.first_name && user.last_name 
                                            ? `${user.first_name} ${user.last_name}` 
                                            : user.username}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fetchingUsers && <FormHelperText>Chargement des utilisateurs...</FormHelperText>}
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()} color="inherit">
                    Annuler
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    color="primary" 
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : (task ? 'Mettre à jour' : 'Créer')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TaskDialog; 