import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    Card, 
    CardContent, 
    Divider, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar, 
    Button, 
    IconButton,
    Chip,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    Business as BusinessIcon,
    Assignment as AssignmentIcon,
    Receipt as ReceiptIcon,
    Description as DescriptionIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    MoreVert as MoreVertIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as MoneyIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        projects: 0,
        clients: 0,
        invoices: 0,
        quotes: 0
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Récupérer les projets au lieu des statistiques
                const projectsResponse = await axios.get('/api/projects/');
                
                if (Array.isArray(projectsResponse.data)) {
                    // Calculer les statistiques à partir des projets
                    setStats({
                        projects: projectsResponse.data.length,
                        clients: new Set(projectsResponse.data.map(p => p.client)).size,
                        invoices: 0,
                        quotes: 0
                    });
                    
                    // Utiliser les projets récents
                    setRecentProjects(projectsResponse.data.slice(0, 5));
                }
                
                // Données d'activités fictives pour le moment
                setRecentActivities([
                    {
                        id: 1,
                        type: 'PROJECT_CREATED',
                        description: 'Nouveau projet créé',
                        user_name: user?.username || 'Utilisateur',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        type: 'CLIENT_CREATED',
                        description: 'Nouveau client ajouté',
                        user_name: user?.username || 'Utilisateur',
                        created_at: new Date(Date.now() - 86400000).toISOString()
                    }
                ]);
            } catch (error) {
                console.error('Erreur lors de la récupération des données du tableau de bord:', error);
                // Données de secours en cas d'erreur
                setStats({
                    projects: 0,
                    clients: 0,
                    invoices: 0,
                    quotes: 0
                });
                setRecentProjects([]);
                setRecentActivities([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardData();
    }, [user]);

    // Formater la date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    
    // Obtenir l'icône pour le type d'activité
    const getActivityIcon = (type) => {
        switch (type) {
            case 'PROJECT_CREATED':
                return <AssignmentIcon />;
            case 'CLIENT_CREATED':
                return <BusinessIcon />;
            case 'INVOICE_CREATED':
                return <ReceiptIcon />;
            case 'QUOTE_CREATED':
                return <DescriptionIcon />;
            default:
                return <TimelineIcon />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                Tableau de bord
                </Typography>
            
            <Grid container spacing={3}>
                {/* Statistiques */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Projets
                                </Typography>
                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                    <AssignmentIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                                {stats.projects}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ArrowUpwardIcon fontSize="small" color="success" />
                                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                                    +8% 
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                    depuis le mois dernier
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Clients
                                </Typography>
                                <Avatar sx={{ bgcolor: 'success.light' }}>
                                    <BusinessIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                                {stats.clients}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ArrowUpwardIcon fontSize="small" color="success" />
                                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                                    +5%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                    depuis le mois dernier
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Factures
                                </Typography>
                                <Avatar sx={{ bgcolor: 'warning.light' }}>
                                    <ReceiptIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                                {stats.invoices}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ArrowUpwardIcon fontSize="small" color="success" />
                                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                                    +12%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                    depuis le mois dernier
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Devis
                                </Typography>
                                <Avatar sx={{ bgcolor: 'info.light' }}>
                                    <DescriptionIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                                {stats.quotes}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ArrowDownwardIcon fontSize="small" color="error" />
                                <Typography variant="body2" color="error.main" sx={{ ml: 0.5 }}>
                                    -3%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                    depuis le mois dernier
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                {/* Projets récents */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Projets récents
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {loading ? (
                                <LinearProgress sx={{ my: 4 }} />
                            ) : recentProjects.length > 0 ? (
                                <List sx={{ p: 0 }}>
                                    {recentProjects.map((project) => (
                                        <ListItem 
                                            key={project.id}
                                            sx={{ 
                                                px: 2, 
                                                py: 1.5,
                                                borderRadius: 2,
                                                mb: 1,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                    cursor: 'pointer'
                                                }
                                            }}
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                    <AssignmentIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {project.name}
                                                        </Typography>
                                                        <Chip 
                                                            label={project.status || 'NEW'} 
                                                            size="small"
                                                            sx={{ 
                                                                fontSize: '0.75rem',
                                                                height: 24,
                                                                bgcolor: 'primary.light',
                                                                color: 'primary.dark'
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.875rem' }} />
                                                            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                                                {project.client_name || 'Client non spécifié'}
                                                            </Typography>
                                                            <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.875rem' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDate(project.start_date) || formatDate(project.created_at)}
                                                            </Typography>
                                                        </Box>
                                                        {project.budget && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.875rem' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {Number(project.budget).toLocaleString('fr-FR')} €
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucun projet récent
                                    </Typography>
                                </Box>
                            )}
                            
                            <Box sx={{ mt: 2, textAlign: 'right' }}>
                                <Button 
                                    color="primary" 
                                    onClick={() => navigate('/projects')}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Voir tous les projets
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                {/* Activités récentes */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Activités récentes
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {loading ? (
                                <LinearProgress sx={{ my: 4 }} />
                            ) : recentActivities.length > 0 ? (
                                <List sx={{ p: 0 }}>
                                    {recentActivities.map((activity) => (
                                        <ListItem 
                                            key={activity.id}
                                            sx={{ 
                                                px: 2, 
                                                py: 1.5, 
                                                borderRadius: 1,
                                                '&:hover': { bgcolor: 'action.hover' },
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => console.log('Voir détails:', activity)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'action.hover' }}>
                                                    {getActivityIcon(activity.type)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={activity.description}
                                                secondary={
                                                    <React.Fragment>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                            <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.875rem' }} />
                                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                                                {activity.user_name}
                                                            </Typography>
                                                            <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.875rem' }} />
                                                            <Typography component="span" variant="body2" color="text.secondary">
                                                                {formatDate(activity.created_at)}
                                                            </Typography>
                                                        </Box>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucune activité récente
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard; 