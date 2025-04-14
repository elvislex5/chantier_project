import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Menu,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Badge,
    Fade
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    PlayArrow as StartIcon,
    Pause as PauseIcon,
    Refresh as RefreshIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import api from '../../services/api';
import TaskDialog from '../tasks/TaskDialog';
import ConfirmDialog from '../common/ConfirmDialog';

function ProjectTasks({ projectId }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);
    const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get(`/api/tasks/project/${projectId}/`);
            
            setTasks(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des tâches:', err);
            setError('Impossible de charger les tâches');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = () => {
        setSelectedTask(null);
        setTaskDialogOpen(true);
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setTaskDialogOpen(true);
    };

    const handleDeleteTask = (task) => {
        setTaskToDelete(task);
        setConfirmDialogOpen(true);
    };

    const handleTaskDialogClose = (updatedTask) => {
        setTaskDialogOpen(false);
        if (updatedTask) {
            fetchTasks();
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/tasks/${taskToDelete.id}/`);
            setConfirmDialogOpen(false);
            setTaskToDelete(null);
            fetchTasks();
        } catch (err) {
            console.error('Erreur lors de la suppression de la tâche:', err);
            setError('Impossible de supprimer la tâche');
            setConfirmDialogOpen(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'todo': 'info',
            'in_progress': 'warning',
            'review': 'secondary',
            'done': 'success'
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'todo': 'À faire',
            'in_progress': 'En cours',
            'review': 'En révision',
            'done': 'Terminée'
        };
        return labels[status] || status;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'default',
            'medium': 'warning',
            'high': 'error',
            'urgent': 'error'
        };
        return colors[priority] || 'default';
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            'low': 'Basse',
            'medium': 'Moyenne',
            'high': 'Haute',
            'urgent': 'Urgente'
        };
        return labels[priority] || priority;
    };

    const handleStatusMenuOpen = (event, task) => {
        event.stopPropagation();
        setStatusMenuAnchorEl(event.currentTarget);
        setSelectedTaskForStatus(task);
    };

    const handleStatusMenuClose = () => {
        setStatusMenuAnchorEl(null);
        setSelectedTaskForStatus(null);
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedTaskForStatus) return;
        
        try {
            setStatusUpdateLoading(true);
            
            const response = await api.post(`/api/tasks/${selectedTaskForStatus.id}/change_status/`, {
                status: newStatus
            });
            
            setTasks(tasks.map(task => 
                task.id === selectedTaskForStatus.id ? response.data : task
            ));
            
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
        } finally {
            setStatusUpdateLoading(false);
            handleStatusMenuClose();
        }
    };

    if (loading && tasks.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Tâches du projet</Typography>
                <Button
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleAddTask}
                >
                    Nouvelle tâche
                </Button>
            </Box>

            {tasks.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        Aucune tâche pour ce projet. Créez votre première tâche en cliquant sur "Nouvelle tâche".
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Titre</TableCell>
                                <TableCell>Assigné à</TableCell>
                                <TableCell>Date d'échéance</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Priorité</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.id} hover>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{task.assigned_to_name || 'Non assigné'}</TableCell>
                                    <TableCell>
                                        {task.end_date ? new Date(task.end_date).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                <Chip 
                                            label={getStatusLabel(task.status)}
                                            color={getStatusColor(task.status)}
                                    size="small"
                                            onClick={(e) => handleStatusMenuOpen(e, task)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={getPriorityLabel(task.priority)}
                                            color={getPriorityColor(task.priority)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Changer le statut">
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleStatusMenuOpen(e, task)}
                                            >
                                                <AssignmentIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleEditTask(task)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleDeleteTask(task)}
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <TaskDialog
                open={taskDialogOpen} 
                onClose={handleTaskDialogClose} 
                task={selectedTask}
                projectId={projectId}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                title="Confirmer la suppression"
                content={`Êtes-vous sûr de vouloir supprimer la tâche "${taskToDelete?.title}" ?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialogOpen(false)}
            />

            <Menu
                anchorEl={statusMenuAnchorEl}
                open={Boolean(statusMenuAnchorEl)}
                onClose={handleStatusMenuClose}
                TransitionComponent={Fade}
            >
                <MenuItem 
                    onClick={() => handleStatusChange('todo')}
                    disabled={selectedTaskForStatus?.status === 'todo' || statusUpdateLoading}
                >
                    <ListItemIcon>
                        <RefreshIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>À faire</ListItemText>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={selectedTaskForStatus?.status === 'in_progress' || statusUpdateLoading}
                >
                    <ListItemIcon>
                        <StartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>En cours</ListItemText>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleStatusChange('review')}
                    disabled={selectedTaskForStatus?.status === 'review' || statusUpdateLoading}
                >
                    <ListItemIcon>
                        <PauseIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>En révision</ListItemText>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleStatusChange('done')}
                    disabled={selectedTaskForStatus?.status === 'done' || statusUpdateLoading}
                >
                    <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Terminée</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default ProjectTasks; 