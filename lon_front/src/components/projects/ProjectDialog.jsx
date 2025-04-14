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
    Grid,
    CircularProgress,
    Alert,
    Autocomplete,
    Chip
} from '@mui/material';
import api from '../../services/api';

function ProjectDialog({ open, onClose, project = null }) {
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        status: 'NEW',
        start_date: '',
        end_date: '',
        description: '',
        location: '',
        budget: '',
        team_members: []
    });
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClients();
        fetchUsers();
        if (project) {
            setFormData({
                name: project.name || '',
                client: project.client || '',
                status: project.status || 'NEW',
                start_date: project.start_date || '',
                end_date: project.end_date || '',
                description: project.description || '',
                location: project.location || '',
                budget: project.budget || '',
                team_members: project.team_members || []
            });
        } else {
            // Format aujourd'hui en YYYY-MM-DD
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                name: '',
                client: '',
                status: 'NEW',
                start_date: today,
                end_date: '',
                description: '',
                location: '',
                budget: '',
                team_members: []
            });
        }
        setError(null);
    }, [project, open]);

    const fetchClients = async () => {
        try {
            setClientsLoading(true);
            const response = await api.get('/api/clients/');
            setClients(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des clients:', error);
        } finally {
            setClientsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await api.get('/api/users/');
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleTeamMembersChange = (event, newValue) => {
        setFormData(prev => ({ ...prev, team_members: newValue.map(user => user.id) }));
        setError(null);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Le nom du projet est obligatoire");
            return false;
        }
        
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            // Préparer les données dans le format attendu par l'API
            const data = {
                name: formData.name,
                client: formData.client ? parseInt(formData.client, 10) : null,
                status: formData.status,
                start_date: formData.start_date,
                end_date: formData.end_date || null,
                description: formData.description || "",
                location: formData.location || "",
                budget: formData.budget || "0",
                team_members: formData.team_members || []
            };

            console.log("Données envoyées à l'API:", data);

            if (project) {
                await api.put(`/api/projects/${project.id}/`, data);
            } else {
                await api.post('/api/projects/', data);
            }
            
            onClose(true);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du projet:', error);
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('\n');
                    setError(errorMessages);
                } else {
                    setError(String(errorData));
                }
            } else {
                setError("Une erreur s'est produite lors de l'enregistrement du projet");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
            <DialogTitle>{project ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                        {error}
                    </Alert>
                )}
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            name="name"
                            label="Nom du projet"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={error && !formData.name.trim()}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Client</InputLabel>
                            <Select
                                name="client"
                                value={formData.client}
                                onChange={handleChange}
                                label="Client"
                                disabled={clientsLoading}
                            >
                                <MenuItem value="" disabled>Sélectionnez un client</MenuItem>
                                {clientsLoading ? (
                                    <MenuItem value="" disabled>Chargement...</MenuItem>
                                ) : (
                                    clients.map(client => (
                                        <MenuItem key={client.id} value={client.id}>
                                            {client.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Statut</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Statut"
                            >
                                <MenuItem value="NEW">Nouveau</MenuItem>
                                <MenuItem value="SIGNED">Signé</MenuItem>
                                <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                                <MenuItem value="PAID">Payé</MenuItem>
                                <MenuItem value="LOST">Perdu</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="location"
                            label="Adresse"
                            value={formData.location}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="budget"
                            label="Budget"
                            type="number"
                            value={formData.budget}
                            onChange={handleChange}
                            fullWidth
                            InputProps={{
                                endAdornment: <span>€</span>,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                                multiple
                            options={users}
                            getOptionLabel={(option) => option.username || ''}
                            value={users.filter(user => formData.team_members.includes(user.id))}
                            onChange={handleTeamMembersChange}
                            loading={usersLoading}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option.username}
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Équipe"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="end_date"
                            label="Date de fin (optionnelle)"
                            type="date"
                            value={formData.end_date}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
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
                </Grid>
                </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)}>Annuler</Button>
                    <Button 
                    onClick={handleSubmit} 
                        variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {project ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </DialogActions>
        </Dialog>
    );
}

export default ProjectDialog; 