import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Flag as FlagIcon,
    CheckCircle as StatusIcon,
    Folder as ProjectIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

function TaskDetailsDialog({ open, onClose, task, onEdit, onDelete }) {
    // Solution temporaire pour déboguer
    const user = null; // Simuler un utilisateur non connecté
    
    if (!task) return null;
    
    // Toujours autoriser les modifications pour le débogage
    const canEdit = true;
    
    // Formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return 'Non définie';
        try {
            return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
        } catch (e) {
            return dateString;
        }
    };
    
    // Obtenir la couleur et le libellé du statut
    const getStatusInfo = (status) => {
        switch (status) {
            case 'todo':
                return { color: 'primary', label: 'À faire' };
            case 'in_progress':
                return { color: 'warning', label: 'En cours' };
            case 'review':
                return { color: 'secondary', label: 'En révision' };
            case 'done':
                return { color: 'success', label: 'Terminée' };
            default:
                return { color: 'default', label: status };
        }
    };
    
    // Obtenir la couleur et le libellé de la priorité
    const getPriorityInfo = (priority) => {
        switch (priority) {
            case 'low':
                return { color: 'info', label: 'Basse' };
            case 'medium':
                return { color: 'primary', label: 'Moyenne' };
            case 'high':
                return { color: 'warning', label: 'Haute' };
            case 'urgent':
                return { color: 'error', label: 'Urgente' };
            default:
                return { color: 'default', label: priority };
        }
    };
    
    const statusInfo = getStatusInfo(task.status);
    const priorityInfo = getPriorityInfo(task.priority);
    
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                    {task.title}
                </Typography>
                <Box>
                    {canEdit && (
                        <>
                            <Tooltip title="Modifier">
                                <IconButton onClick={() => onEdit(task)} color="primary">
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                                <IconButton onClick={() => onDelete(task)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StatusIcon color={statusInfo.color} sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Statut:
                                </Typography>
                                <Chip 
                                    label={statusInfo.label} 
                                    color={statusInfo.color} 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FlagIcon color={priorityInfo.color} sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Priorité:
                                </Typography>
                                <Chip 
                                    label={priorityInfo.label} 
                                    color={priorityInfo.color} 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Début: {formatDate(task.start_date)}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Échéance: {formatDate(task.end_date)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Assignée à: {task.assigned_to ? 
                                        (task.assigned_to.first_name && task.assigned_to.last_name ? 
                                            `${task.assigned_to.first_name} ${task.assigned_to.last_name}` : 
                                            task.assigned_to.username) : 
                                        'Non assignée'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ProjectIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Projet: {task.project ? task.project.name : 'Aucun projet'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                    Description
                </Typography>
                <Typography variant="body1" paragraph>
                    {task.description || 'Aucune description'}
                </Typography>
                
                {task.created_by && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Créée par {task.created_by.first_name && task.created_by.last_name ? 
                                `${task.created_by.first_name} ${task.created_by.last_name}` : 
                                task.created_by.username}
                            {task.created_at && ` le ${formatDate(task.created_at)}`}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Fermer
                </Button>
                {canEdit && (
                    <Button 
                        onClick={() => onEdit(task)} 
                        color="primary" 
                        variant="contained"
                    >
                        Modifier
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default TaskDetailsDialog; 