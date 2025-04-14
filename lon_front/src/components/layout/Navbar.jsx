import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    InputBase,
    Menu,
    MenuItem,
    Paper,
    Fade,
    Badge,
    Avatar,
    Tooltip,
    Divider,
    ListItemIcon,
    List,
    ListItem,
    ListItemText,
    Popper,
    Grow,
    ClickAwayListener
} from '@mui/material';
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Close as CloseIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { alpha, styled } from '@mui/material/styles';
import axios from 'axios';

// Style pour la barre de recherche - centré et amélioré
const SearchWrapper = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: 'auto',
    marginLeft: 'auto',
    width: '40%',
    [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
    },
}));

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchAnchorEl, setSearchAnchorEl] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Récupérer les notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Utiliser des notifications fictives au lieu de l'API
                const mockNotifications = [
                    {
                        id: 1,
                        title: 'Nouveau projet',
                        message: 'Un nouveau projet a été créé',
                        created_at: new Date().toISOString(),
                        read: false
                    },
                    {
                        id: 2,
                        title: 'Tâche terminée',
                        message: 'Une tâche a été marquée comme terminée',
                        created_at: new Date(Date.now() - 3600000).toISOString(),
                        read: false
                    }
                ];
                
                setNotifications(mockNotifications);
                setUnreadCount(mockNotifications.filter(n => !n.read).length);
            } catch (error) {
                console.error('Erreur lors de la récupération des notifications:', error);
                setNotifications([]);
                setUnreadCount(0);
            }
        };

        fetchNotifications();
        
        // Rafraîchir les notifications toutes les 30 secondes
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Marquer les notifications comme lues
    const markNotificationsAsRead = async () => {
        try {
            await axios.post('/api/notifications/mark-read', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Mettre à jour l'état local
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Erreur lors du marquage des notifications:', error);
        }
    };

    // Fonction de recherche
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length >= 2) {
            setIsSearching(true);
            try {
                // Recherche de projets
                const projectsResponse = await axios.get(`/api/projects/search?q=${query}`);
                // Recherche de tâches
                const tasksResponse = await axios.get(`/api/tasks/search?q=${query}`);
                
                setSearchResults([
                    ...projectsResponse.data.map(project => ({
                        ...project,
                        type: 'project'
                    })),
                    ...tasksResponse.data.map(task => ({
                        ...task,
                        type: 'task'
                    }))
                ]);
            } catch (error) {
                console.error('Erreur lors de la recherche:', error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const handleSearchFocus = (event) => {
        setSearchAnchorEl(event.currentTarget);
    };

    const handleSearchClose = () => {
        setSearchAnchorEl(null);
        setIsSearching(false);
    };

    const handleSearchResultClick = (result) => {
        if (result.type === 'project') {
            navigate(`/projects/${result.id}`);
        } else if (result.type === 'task') {
            navigate(`/tasks/${result.id}`);
        }
        handleSearchClose();
        setSearchQuery('');
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
    };

    // Gestion du menu utilisateur
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Gestion des notifications
    const handleNotificationOpen = (event) => {
        setNotificationAnchorEl(event.currentTarget);
        // Marquer les notifications comme lues
        if (unreadCount > 0) {
            markNotificationsAsRead();
        }
    };

    const handleNotificationClose = () => {
        setNotificationAnchorEl(null);
    };

    // Obtenir les initiales de l'utilisateur pour l'avatar
    const getUserInitials = () => {
        if (!user || !user.username) return 'U';
        
        const nameParts = user.username.split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography 
                    variant="h6" 
                    noWrap
                    component="div"
                    sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, mr: 3 }}
                >
                    LON Chantiers
                </Typography>

                {/* Barre de recherche */}
                <SearchWrapper>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Rechercher..."
                        inputProps={{ 'aria-label': 'search' }}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        endAdornment={
                            searchQuery && (
                                <IconButton 
                                    size="small" 
                                    sx={{ color: 'white' }}
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }
                    />
                </SearchWrapper>
                
                <Popper
                    open={Boolean(searchAnchorEl) && isSearching}
                    anchorEl={searchAnchorEl}
                    placement="bottom-start"
                    transition
                    disablePortal
                    style={{ zIndex: 1300, width: searchAnchorEl ? searchAnchorEl.clientWidth : undefined }}
                >
                    {({ TransitionProps }) => (
                        <Grow {...TransitionProps}>
                            <Paper elevation={3} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
                                <ClickAwayListener onClickAway={handleSearchClose}>
                                    <List dense>
                                        {searchResults.length > 0 ? (
                                            searchResults.map((result) => (
                                                <ListItem 
                                                    button 
                                                    key={`${result.type}-${result.id}`}
                                                    onClick={() => handleSearchResultClick(result)}
                                                >
                                                    <ListItemIcon>
                                                        {result.type === 'project' ? 
                                                            <PersonIcon color="primary" /> : 
                                                            <PersonIcon color="secondary" />
                                                        }
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={result.name || result.title} 
                                                        secondary={result.type === 'project' ? 'Chantier' : 'Tâche'} 
                                                    />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <ListItem>
                                                <ListItemText 
                                                    primary={searchQuery.length < 2 ? 
                                                        "Saisissez au moins 2 caractères" : 
                                                        "Aucun résultat trouvé"
                                                    } 
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </ClickAwayListener>
                    </Paper>
                        </Grow>
                )}
                </Popper>

                <Box sx={{ display: 'flex', ml: 'auto' }}>
                    <IconButton 
                        color="inherit" 
                        onClick={handleNotificationOpen}
                        aria-label="show notifications"
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <Menu
                        anchorEl={notificationAnchorEl}
                        open={Boolean(notificationAnchorEl)}
                        onClose={handleNotificationClose}
                        PaperProps={{
                            elevation: 3,
                            sx: { 
                                width: 320,
                                maxHeight: 400,
                                overflow: 'auto',
                                mt: 1.5,
                                '& .MuiMenuItem-root': {
                                    px: 2,
                                    py: 1,
                                    borderBottom: '1px solid #f0f0f0',
                                    '&:last-child': {
                                        borderBottom: 'none'
                                    }
                                }
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 600 }}>
                            Notifications
                        </Typography>
                        <Divider />
                        
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <MenuItem 
                                    key={notification.id} 
                                    onClick={handleNotificationClose}
                                    sx={{
                                        backgroundColor: notification.read ? 'transparent' : alpha('#e3f2fd', 0.5),
                                    }}
                                >
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="body1" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">
                                    Aucune notification
                                </Typography>
                            </MenuItem>
                        )}
                    </Menu>
                    
                    <Tooltip title="Paramètres du compte">
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-haspopup="true"
                            onClick={handleMenuOpen}
                            color="inherit"
                            sx={{ ml: 1 }}
                        >
                            {user?.avatar_url ? (
                                <Avatar 
                                    src={user.avatar_url} 
                                    alt={user.username}
                                    sx={{ width: 32, height: 32 }}
                                />
                            ) : (
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    {getUserInitials()}
                                </Avatar>
                            )}
                    </IconButton>
                    </Tooltip>
                    
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            elevation: 3,
                            sx: { width: 220, mt: 1.5 }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {user?.username || 'Utilisateur'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email || 'email@example.com'}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            Mon profil
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Paramètres
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Déconnexion
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar; 