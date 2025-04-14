import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Tabs,
    Tab,
    LinearProgress,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import ProjectTasks from './ProjectTasks';
import ProjectDialog from './ProjectDialog';
import api from '../../services/api';

// Fonction pour obtenir le libellé du statut
const getStatusLabel = (status) => {
    const labels = {
        'NEW': 'Nouveau',
        'SIGNED': 'Signé',
        'IN_PROGRESS': 'En cours',
        'PAID': 'Payé',
        'LOST': 'Perdu'
    };
    return labels[status] || status;
};

// Fonction pour obtenir la couleur du statut
const getStatusColor = (status) => {
    const colors = {
        'NEW': 'info',
        'SIGNED': 'primary',
        'IN_PROGRESS': 'warning',
        'PAID': 'success',
        'LOST': 'error'
    };
    return colors[status] || 'default';
};

function ProjectDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [anchorEl, setAnchorEl] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/projects/${id}/`);
            setProject(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération du projet:', err);
            setError('Erreur lors de la récupération du projet');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOpenDialog = () => {
        setEditDialogOpen(true);
        handleMenuClose();
    };

    const handleCloseDialog = (refresh = false) => {
        setEditDialogOpen(false);
        if (refresh) {
            fetchProject();
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/api/projects/${id}/`);
            navigate('/projects');
        } catch (err) {
            console.error('Erreur lors de la suppression du projet:', err);
            alert('Erreur lors de la suppression du projet');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Chargement du projet...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/projects')}
                    sx={{ mt: 2 }}
                >
                    Retour aux projets
                </Button>
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning">Projet non trouvé</Alert>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/projects')}
                    sx={{ mt: 2 }}
                >
                    Retour aux projets
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* En-tête du projet */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                        onClick={() => navigate('/projects')}
                        sx={{ mr: 1 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                        {project.name}
                    </Typography>
                    <Chip 
                        label={getStatusLabel(project.status)}
                        color={getStatusColor(project.status)}
                        size="small"
                        sx={{ ml: 2 }}
                    />
                </Box>
                <Box>
                    <IconButton onClick={handleMenuClick}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleOpenDialog}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Modifier
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                            Supprimer
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Onglets pour les tâches, documents, etc. */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab value="dashboard" label="Tableau de bord" />
                    <Tab value="tasks" label="Tâches" />
                    <Tab value="documents" label="Documents" />
                    <Tab value="team" label="Équipe" />
                </Tabs>
            </Box>

            {/* Contenu des onglets */}
            <Box>
                {activeTab === 'dashboard' && (
                <Grid container spacing={3}>
                        {/* Informations générales */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Informations générales</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                                        <Typography variant="body1">{project.client_name || 'Non défini'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Responsable</Typography>
                                        <Typography variant="body1">{project.manager_name || 'Non défini'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Date de début</Typography>
                                        <Typography variant="body1">
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Non définie'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Date de fin</Typography>
                                        <Typography variant="body1">
                                            {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Non définie'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Adresse</Typography>
                                        <Typography variant="body1">{project.location || 'Non définie'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Budget</Typography>
                                        <Typography variant="body1">
                                            {project.budget ? `${project.budget.toLocaleString()} €` : 'Non défini'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                        </Paper>
                    </Grid>

                        {/* Progression et statistiques */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Progression</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Progression</Typography>
                                    <Typography variant="h6">{project.progress || 0}%</Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={project.progress || 0} 
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                                
                                {/* Statistiques des tâches */}
                                {project.task_statistics && (
                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                                                <Typography variant="h6">{project.task_statistics.total || 0}</Typography>
                                                <Typography variant="body2" color="text.secondary">Tâches totales</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                                                <Typography variant="h6">{project.task_statistics.todo || 0}</Typography>
                                                <Typography variant="body2">À faire</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                                                <Typography variant="h6">{project.task_statistics.in_progress || 0}</Typography>
                                                <Typography variant="body2">En cours</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                                                <Typography variant="h6">{project.task_statistics.done || 0}</Typography>
                                                <Typography variant="body2">Terminées</Typography>
                        </Paper>
                    </Grid>
                                    </Grid>
                                )}
                        </Paper>
                    </Grid>
                </Grid>
                )}

                {activeTab === 'tasks' && (
                <ProjectTasks projectId={id} />
                )}
                
                {activeTab === 'documents' && (
                    <Paper sx={{ p: 3 }}>
                        <Typography>Fonctionnalité de gestion des documents à venir</Typography>
                    </Paper>
                )}
                
                {activeTab === 'team' && (
                    <Paper sx={{ p: 3 }}>
                        <Typography>Fonctionnalité de gestion d'équipe à venir</Typography>
                    </Paper>
                )}
            </Box>

            {/* Dialogue de modification */}
            <ProjectDialog
                open={editDialogOpen}
                onClose={handleCloseDialog}
                project={project}
            />

            {/* Dialogue de confirmation de suppression */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer le projet "{project.name}" ?
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Annuler</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Supprimer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProjectDetails; 