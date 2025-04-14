import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Chip,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    Event as EventIcon,
    Assignment as TaskIcon,
    Today as TodayIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../services/api';
import TaskDialog from '../tasks/TaskDialog';
import TaskDetailsDialog from '../tasks/TaskDetailsDialog';

// Configuration du localisateur pour react-big-calendar
const locales = {
    'fr': fr,
};

const customFormat = (date, formatString) => {
    const correctedFormatString = formatString.replace(/YYYY/g, 'yyyy');
    return format(date, correctedFormatString, { locale: fr });
};

const localizer = dateFnsLocalizer({
    format: customFormat,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Messages en français pour le calendrier
const messages = {
    allDay: 'Journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: 'Aujourd\'hui',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Liste',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucune tâche dans cette période',
};

function ProjectCalendar() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [dateDialogOpen, setDateDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        statuses: ['todo', 'in_progress', 'review'],
        showCompleted: false
    });
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [events, setEvents] = useState([]);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchTasks();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [filters, selectedProject, currentDate]);

    // Convertir les tâches en événements pour le calendrier
    useEffect(() => {
        const newEvents = tasks.map(task => {
            // Vérifier que les dates sont valides
            let startDate = null;
            let endDate = null;
            
            try {
                startDate = task.start_date ? new Date(task.start_date) : null;
                // Vérifier si la date est valide
                if (startDate && isNaN(startDate.getTime())) {
                    console.warn(`Date de début invalide pour ${task.title}: ${task.start_date}`);
                    startDate = null;
                }
            } catch (e) {
                console.warn(`Erreur lors de la conversion de la date de début pour ${task.title}`);
            }
            
            try {
                endDate = task.end_date ? new Date(task.end_date) : null;
                // Vérifier si la date est valide
                if (endDate && isNaN(endDate.getTime())) {
                    console.warn(`Date de fin invalide pour ${task.title}: ${task.end_date}`);
                    endDate = null;
                }
            } catch (e) {
                console.warn(`Erreur lors de la conversion de la date de fin pour ${task.title}`);
            }
            
            // Si pas de date de début, ignorer cette tâche
            if (!startDate) {
                return null;
            }
            
            // Si pas de date de fin, utiliser la date de début
            if (!endDate) {
                endDate = new Date(startDate);
            }
            
            return {
                id: task.id,
                title: task.title,
                start: startDate,
                end: endDate,
                resource: task
            };
        }).filter(event => event !== null); // Filtrer les événements null
        
        setEvents(newEvents);
    }, [tasks]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'todo': return '#3788d8'; // Bleu
            case 'in_progress': return '#f39c12'; // Orange
            case 'review': return '#9c27b0'; // Violet
            case 'done': return '#2ecc71'; // Vert
            default: return '#3788d8'; // Bleu par défaut
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/api/projects/');
            setProjects(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des projets:', err);
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);

            // Préparer les paramètres de requête
            let params = {};
            
            // Récupérer les tâches sur une période plus large pour voir plus de tâches
            // Trois mois avant et trois mois après le mois actuel
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 4, 0);
            
            params.start_date_after = startDate.toISOString().split('T')[0];
            params.end_date_before = endDate.toISOString().split('T')[0];
            
            if (selectedProject) params.project = selectedProject;

            // Construire l'URL avec les paramètres
            const queryString = new URLSearchParams(params).toString();
            const url = `/api/tasks/${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);
            
            // Filtrer les tâches selon les filtres actuels
            let filteredTasks = response.data;
            
            if (filters.statuses.length > 0) {
                filteredTasks = filteredTasks.filter(task => filters.statuses.includes(task.status));
            }
            
            if (!filters.showCompleted) {
                filteredTasks = filteredTasks.filter(task => task.status !== 'done');
            } else {
                // Si on montre les tâches terminées, les ajouter aux filtres
                if (!filters.statuses.includes('done')) {
                    filteredTasks = filteredTasks.filter(task => 
                        filters.statuses.includes(task.status) || task.status === 'done'
                    );
                }
            }
            
            setTasks(filteredTasks);
        } catch (err) {
            console.error('Erreur lors de la récupération des tâches:', err);
            setError('Impossible de charger les tâches');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (action) => {
        let newDate = new Date(currentDate);
        
        switch (action) {
            case 'prev':
                newDate = subMonths(currentDate, 1);
                break;
            case 'next':
                newDate = addMonths(currentDate, 1);
                break;
            case 'today':
                newDate = new Date();
                break;
            default:
                break;
        }
        
        setCurrentDate(newDate);
    };

    const handleSelectEvent = (event) => {
        setSelectedTask(event.resource);
        setDetailsDialogOpen(true);
    };

    const handleSelectSlot = ({ start }) => {
        setSelectedDate(start);
        setDateDialogOpen(true);
    };

    const handleCreateTask = () => {
        setDateDialogOpen(false);
        setTaskDialogOpen(true);
    };

    const handleTaskDialogClose = (updatedTask) => {
        setTaskDialogOpen(false);
        setSelectedTask(null);
        
        if (updatedTask) {
            fetchTasks(); // Rafraîchir les tâches après création/modification
        }
    };

    const handleProjectChange = (event) => {
        setSelectedProject(event.target.value);
    };

    const handleEditTask = (task) => {
        setDetailsDialogOpen(false);
        setTaskDialogOpen(true);
    };

    const handleDeleteTask = (task) => {
        setTaskToDelete(task);
        setDetailsDialogOpen(false);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteTask = async () => {
        try {
            await api.delete(`/api/tasks/${taskToDelete.id}/`);
            setDeleteDialogOpen(false);
            fetchTasks(); // Rafraîchir la liste des tâches
        } catch (err) {
            console.error('Erreur lors de la suppression de la tâche:', err);
            setError('Impossible de supprimer la tâche');
        }
    };

    // Formater la date courante pour l'affichage
    const formattedDate = format(currentDate, 'MMMM yyyy', { locale: fr });

    // Fonction pour personnaliser l'apparence des événements
    const eventStyleGetter = (event) => {
        const status = event.resource.status;
        const backgroundColor = getStatusColor(status);
        
        return {
            style: {
                backgroundColor,
                borderColor: backgroundColor,
                color: '#ffffff',
                fontWeight: 500,
                opacity: status === 'done' ? 0.7 : 1,
                borderRadius: '4px',
                border: 'none',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }
        };
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Calendrier des tâches
            </Typography>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => handleDateChange('prev')}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Button 
                            onClick={() => handleDateChange('today')}
                            startIcon={<TodayIcon />}
                            sx={{ mx: 1 }}
                        >
                            Aujourd'hui
                        </Button>
                        <IconButton onClick={() => handleDateChange('next')}>
                            <ArrowForwardIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ ml: 2 }}>
                            {formattedDate}
                        </Typography>
                    </Box>
                    <Box>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedDate(new Date());
                                setTaskDialogOpen(true);
                            }}
                        >
                            Nouvelle tâche
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="project-select-label">Projet</InputLabel>
                            <Select
                                labelId="project-select-label"
                                value={selectedProject || ''}
                                onChange={handleProjectChange}
                                label="Projet"
                                size="small"
                            >
                                <MenuItem value="">Tous les projets</MenuItem>
                                {projects.map(project => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchTasks}
                            size="small"
                            sx={{ ml: 2 }}
                        >
                            Rafraîchir
                        </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            Filtres:
                        </Typography>
                        <Chip 
                            label="À faire" 
                            color={filters.statuses.includes('todo') ? 'primary' : 'default'}
                            onClick={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    statuses: prev.statuses.includes('todo') 
                                        ? prev.statuses.filter(s => s !== 'todo')
                                        : [...prev.statuses, 'todo']
                                }));
                            }}
                            sx={{ mr: 1 }}
                        />
                        <Chip 
                            label="En cours" 
                            color={filters.statuses.includes('in_progress') ? 'warning' : 'default'}
                            onClick={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    statuses: prev.statuses.includes('in_progress') 
                                        ? prev.statuses.filter(s => s !== 'in_progress')
                                        : [...prev.statuses, 'in_progress']
                                }));
                            }}
                            sx={{ mr: 1 }}
                        />
                        <Chip 
                            label="En révision" 
                            color={filters.statuses.includes('review') ? 'secondary' : 'default'}
                            onClick={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    statuses: prev.statuses.includes('review') 
                                        ? prev.statuses.filter(s => s !== 'review')
                                        : [...prev.statuses, 'review']
                                }));
                            }}
                            sx={{ mr: 1 }}
                        />
                        <Chip 
                            label="Terminées" 
                            color={filters.showCompleted ? 'success' : 'default'}
                            onClick={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    showCompleted: !prev.showCompleted
                                }));
                            }}
                        />
                    </Box>
                </Box>
            </Paper>

            {loading && tasks.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : (
                <Paper sx={{ p: 2, minHeight: '600px' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        selectable
                        messages={messages}
                        culture="fr"
                        date={currentDate}
                        onNavigate={date => setCurrentDate(date)}
                        eventPropGetter={eventStyleGetter}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView="month"
                        popup
                        showMultiDayTimes
                        step={60}
                        timeslots={1}
                        min={new Date(0, 0, 0, 8, 0)}
                        max={new Date(0, 0, 0, 20, 0)}
                        formats={{
                            dayFormat: 'EEE dd',
                            weekdayFormat: 'EEE',
                            agendaDateFormat: 'EEE dd MMM',
                            agendaHeaderFormat: ({ start, end }) => 
                                `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`,
                            monthHeaderFormat: 'MMMM yyyy',
                            dayHeaderFormat: 'cccc dd MMM yyyy',
                            dayRangeHeaderFormat: ({ start, end }) => 
                                `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`
                        }}
                    />
                </Paper>
            )}

            {/* Dialogue pour les détails d'une tâche */}
            <TaskDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                task={selectedTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
            />

            {/* Dialogue pour créer/modifier une tâche */}
            <TaskDialog
                open={taskDialogOpen}
                onClose={handleTaskDialogClose}
                task={selectedTask}
                projectId={selectedProject}
                initialDate={selectedDate}
            />

            {/* Dialogue pour confirmer la suppression */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={confirmDeleteTask} color="error" variant="contained">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue pour la sélection d'une date */}
            <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)}>
                <DialogTitle>
                    {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : ''}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Que souhaitez-vous créer ?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<TaskIcon />}
                            onClick={handleCreateTask}
                            fullWidth
                        >
                            Tâche
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<EventIcon />}
                            onClick={() => setDateDialogOpen(false)}
                            fullWidth
                            disabled
                        >
                            Événement
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDateDialogOpen(false)}>Annuler</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProjectCalendar; 