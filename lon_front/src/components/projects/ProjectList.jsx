import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../../services/api';
import ProjectDialog from './ProjectDialog';

function ProjectList() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/projects/');
            console.log('Projets récupérés:', response.data);
            setProjects(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            setError("Impossible de charger les projets. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (project = null) => {
        setSelectedProject(project);
        setOpenDialog(true);
    };

    const handleCloseDialog = (refresh = false) => {
        setOpenDialog(false);
        setSelectedProject(null);
        if (refresh) {
            fetchProjects();
        }
    };

    const handleDeleteClick = (project, e) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/api/projects/${projectToDelete.id}/`);
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
            fetchProjects();
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            alert('Erreur lors de la suppression du projet');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
    };

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

    if (loading && projects.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Chantiers</Typography>
                <Box>
                    <Button 
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchProjects}
                        sx={{ mr: 1 }}
                    >
                        Actualiser
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Nouveau chantier
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {projects.length === 0 && !loading ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                        Aucun projet trouvé. Créez votre premier projet en cliquant sur "Nouveau chantier".
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom du chantier</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Date de début</TableCell>
                                <TableCell>Date de fin</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow 
                                    key={project.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.client_name || 'Non défini'}</TableCell>
                                    <TableCell>{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={getStatusLabel(project.status)}
                                            color={getStatusColor(project.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/projects/${project.id}`);
                                            }}
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDialog(project);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => handleDeleteClick(project, e)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <ProjectDialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                project={selectedProject} 
            />

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete?.name}" ?
                    Cette action est irréversible.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Annuler</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Supprimer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProjectList;