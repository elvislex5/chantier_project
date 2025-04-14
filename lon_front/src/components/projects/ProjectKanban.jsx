import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    Menu, 
    MenuItem,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Stack,
    CircularProgress,
    Snackbar,
    Alert,
    LinearProgress,
    Chip,
    Avatar,
    Tooltip,
    Paper,
    Divider,
    AvatarGroup as MuiAvatarGroup,
    ListItemIcon,
    ListItemText,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
    SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../services/api';
import ProjectDialog from './ProjectDialog';

// Styles pour le tableau Kanban
const KanbanColumn = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    minHeight: 500,
    width: '100%',
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column'
}));

const KanbanCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
                cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
    }
}));

const AvatarGroup = styled(MuiAvatarGroup)(({ theme }) => ({
    '& .MuiAvatar-root': {
        width: 28,
        height: 28,
        fontSize: '0.875rem'
    }
}));

// Style pour la zone de drop
const DropZone = styled(Box)(({ theme, isDraggingOver }) => ({
    minHeight: '100%',
    padding: theme.spacing(1),
    backgroundColor: isDraggingOver ? theme.palette.action.hover : 'transparent',
    flexGrow: 1,
    transition: 'background-color 0.2s ease',
    borderRadius: theme.shape.borderRadius
}));

function ProjectKanban() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState({
        NEW: [],
        SIGNED: [],
        IN_PROGRESS: [],
        PAID: [],
        LOST: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuProject, setMenuProject] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [dragUpdateLoading, setDragUpdateLoading] = useState(false);
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
            
            // Réinitialiser les projets avant de les regrouper par statut
            const groupedProjects = {
                NEW: [],
                SIGNED: [],
                IN_PROGRESS: [],
                PAID: [],
                LOST: []
            };
            
            // Regrouper les projets par statut
            response.data.forEach(project => {
                if (groupedProjects[project.status]) {
                    groupedProjects[project.status].push(project);
                }
            });
            
            setProjects(groupedProjects);
        } catch (err) {
            console.error('Erreur lors de la récupération des projets:', err);
            setError('Impossible de charger les projets');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMenu = (event, project) => {
        setAnchorEl(event.currentTarget);
        setMenuProject(project);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuProject(null);
    };

    const handleOpenDialog = (project = null) => {
        setSelectedProject(project);
        setDialogOpen(true);
        handleCloseMenu();
    };

    const handleViewProject = (project) => {
        navigate(`/projects/${project.id}`);
        handleCloseMenu();
    };

    const handleOpenDeleteDialog = (project) => {
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
        handleCloseMenu();
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        
        try {
            await api.delete(`/api/projects/${projectToDelete.id}/`);
            
            // Mettre à jour l'état local en supprimant le projet
            setProjects(prev => {
                const newProjects = { ...prev };
                newProjects[projectToDelete.status] = newProjects[projectToDelete.status].filter(p => p.id !== projectToDelete.id);
                return newProjects;
            });
            
            setSnackbar({
                open: true,
                message: 'Projet supprimé avec succès',
                severity: 'success'
            });
        } catch (err) {
            console.error('Erreur lors de la suppression du projet:', err);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression du projet',
                severity: 'error'
            });
        } finally {
            handleCloseDeleteDialog();
        }
    };

    const handleDeleteProject = (project) => {
        handleOpenDeleteDialog(project);
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

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

    // Fonction pour gérer la fin du glisser-déposer
    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        
        // Si pas de destination ou même colonne et même position, ne rien faire
        if (!destination || 
            (source.droppableId === destination.droppableId && 
             source.index === destination.index)) {
            return;
        }
        
        // Récupérer le projet déplacé
        const projectId = parseInt(draggableId.split('-')[1]);
        const project = Object.values(projects)
            .flat()
            .find(p => p.id === projectId);
            
        if (!project) return;
        
        // Nouveau statut (destination.droppableId)
        const newStatus = destination.droppableId;
        
        // Si le statut n'a pas changé, ne rien faire
        if (project.status === newStatus) return;
        
        try {
            setDragUpdateLoading(true);
            
            // Optimistic update - mettre à jour l'UI immédiatement
            setProjects(prev => {
                const newProjects = { ...prev };
                
                // Retirer le projet de son ancienne colonne
                newProjects[project.status] = newProjects[project.status].filter(
                    p => p.id !== project.id
                );
                
                // Ajouter le projet à sa nouvelle colonne avec le nouveau statut
                const updatedProject = { ...project, status: newStatus };
                newProjects[newStatus] = [...newProjects[newStatus], updatedProject];
                
                return newProjects;
            });
            
            // Appel API pour mettre à jour le statut
            await api.patch(`/api/projects/${project.id}/`, {
                status: newStatus
            });
            
            setSnackbar({
                open: true,
                message: 'Statut du projet mis à jour avec succès',
                severity: 'success'
            });
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
            
            // En cas d'erreur, revenir à l'état précédent
                fetchProjects();
            
            setSnackbar({
                open: true,
                message: 'Erreur lors de la mise à jour du statut',
                severity: 'error'
            });
        } finally {
            setDragUpdateLoading(false);
        }
    };

    if (loading && Object.values(projects).every(arr => arr.length === 0)) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Chargement des projets...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={fetchProjects}
                    startIcon={<RefreshIcon />}
                >
                    Réessayer
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Tableau Kanban des projets
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nouveau projet
                </Button>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {Object.entries(projects).map(([status, statusProjects]) => (
                        <Box key={status} sx={{ minWidth: 280, maxWidth: 280 }}>
                            <KanbanColumn>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {getStatusLabel(status)}
                                    </Typography>
                                    <Chip 
                                        label={statusProjects.length} 
                                        color={getStatusColor(status)}
                                        size="small"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                
                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <DropZone
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                            isDraggingOver={snapshot.isDraggingOver}
                                        >
                                            {statusProjects.length === 0 ? (
                                                <Box sx={{ 
                                                    height: '100%', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    p: 2,
                                                    bgcolor: 'background.default',
                                                    borderRadius: 1,
                                                    border: '1px dashed',
                                                    borderColor: 'divider'
                                                }}>
                                                    <Typography color="text.secondary" align="center">
                                                        Aucun projet {getStatusLabel(status).toLowerCase()}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                statusProjects.map((project, index) => (
                                            <Draggable
                                                        key={`project-${project.id}`} 
                                                        draggableId={`project-${project.id}`} 
                                                index={index}
                                            >
                                                        {(provided, snapshot) => (
                                                            <KanbanCard
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                                variant="outlined"
                                                                sx={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1
                                                                }}
                                                            >
                                                                <CardContent sx={{ pb: 1 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                        <Typography 
                                                                            variant="subtitle1" 
                                                                            sx={{ 
                                                                                fontWeight: 600,
                                                                                cursor: 'pointer',
                                                                                '&:hover': { color: 'primary.main' }
                                                                            }}
                                                                            onClick={() => handleViewProject(project)}
                                                                        >
                                                                            {project.name}
                                                                        </Typography>
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={(e) => handleOpenMenu(e, project)}
                                                                        >
                                                                            <MoreVertIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                    
                                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                                        {project.client_name || 'Client non défini'}
                                                                    </Typography>
                                                                    
                                                                    {project.progress !== null && (
                                                                        <Box sx={{ mt: 2, mb: 1 }}>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Progression
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {project.progress}%
                                                                                </Typography>
                                                                            </Box>
                                                                            <LinearProgress 
                                                                                variant="determinate" 
                                                                                value={project.progress} 
                                                                                sx={{ height: 6, borderRadius: 3 }}
                                                                            />
                                                                        </Box>
                                                                    )}
                                                                    
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                                        {project.team_members && project.team_members.length > 0 ? (
                                                                            <AvatarGroup max={3}>
                                                                                {project.team_members.map(member => (
                                                                                    <Tooltip key={member.id} title={member.username}>
                                                                                        <Avatar 
                                                                                            alt={member.username} 
                                                                                            src={member.avatar} 
                                                                                        />
                                                                                    </Tooltip>
                                                                                ))}
                                                                            </AvatarGroup>
                                                                        ) : (
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Aucun membre
                                                                            </Typography>
                                                                        )}
                                                                        
                                                                        {project.end_date && (
                                                                            <Tooltip title="Date d'échéance">
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {new Date(project.end_date).toLocaleDateString()}
                                                                                </Typography>
                                                                            </Tooltip>
                                                                        )}
                                                                    </Box>
                                                                </CardContent>
                                                            </KanbanCard>
                                                )}
                                            </Draggable>
                                                ))
                                            )}
                                        {provided.placeholder}
                                        </DropZone>
                                )}
                            </Droppable>
                            </KanbanColumn>
                        </Box>
                    ))}
                </Box>
            </DragDropContext>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={() => handleViewProject(menuProject)}>
                    <ListItemIcon>
                        <ViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Voir les détails</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleOpenDialog(menuProject)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Modifier</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleDeleteProject(menuProject)} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Supprimer</ListItemText>
                </MenuItem>
            </Menu>

            <ProjectDialog
                open={dialogOpen}
                onClose={(success) => {
                    setDialogOpen(false);
                    if (success) {
                        fetchProjects();
                        setSelectedProject(null);
                    }
                }}
                project={selectedProject}
            />

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirmer la suppression
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete?.name}" ?
                        Cette action est irréversible et supprimera toutes les tâches associées.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        variant="contained"
                        autoFocus
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ProjectKanban; 