import React from 'react';
import { 
    Box, 
    Drawer, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText,
    Divider, 
    Typography,
    Collapse,
    IconButton,
    Toolbar
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    Receipt as ReceiptIcon,
    Description as DescriptionIcon,
    Settings as SettingsIcon,
    ExpandLess,
    ExpandMore,
    People as PeopleIcon,
    Folder as FolderIcon,
    ViewKanban as ViewKanbanIcon,
    ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

// Style pour le drawer
const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
    },
}));

function Sidebar({ open, handleDrawerToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [projectsOpen, setProjectsOpen] = React.useState(true);
    const [financesOpen, setFinancesOpen] = React.useState(false);
    
    const handleProjectsClick = () => {
        setProjectsOpen(!projectsOpen);
    };
    
    const handleFinancesClick = () => {
        setFinancesOpen(!financesOpen);
    };
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        {
            text: 'Tableau de bord',
            icon: <DashboardIcon />,
            path: '/',
            active: isActive('/') || isActive('/dashboard')
        },
        {
            text: 'Projets',
            icon: <AssignmentIcon />,
            path: '/projects',
            active: isActive('/projects') || location.pathname.startsWith('/projects/'),
            submenu: true,
            open: projectsOpen,
            handleClick: handleProjectsClick,
            items: [
                {
                    text: 'Tous les projets',
                    path: '/projects',
                    active: isActive('/projects')
                },
                {
                    text: 'Kanban',
                    path: '/projects/kanban',
                    active: isActive('/projects/kanban')
                },
                {
                    text: 'Calendrier',
                    path: '/projects/calendar',
                    active: isActive('/projects/calendar')
                }
            ]
        },
        {
            text: 'Clients',
            icon: <BusinessIcon />,
            path: '/clients',
            active: isActive('/clients')
        },
        {
            text: 'Finances',
            icon: <ReceiptIcon />,
            path: '/finances',
            active: isActive('/finances') || location.pathname.startsWith('/finances/'),
            submenu: true,
            open: financesOpen,
            handleClick: handleFinancesClick,
            items: [
                {
                    text: 'Factures',
                    path: '/finances/invoices',
                    active: isActive('/finances/invoices')
                },
                {
                    text: 'Devis',
                    path: '/finances/quotes',
                    active: isActive('/finances/quotes')
                }
            ]
        },
        {
            text: 'Documents',
            icon: <DescriptionIcon />,
            path: '/documents',
            active: isActive('/documents')
        },
        {
            text: 'Équipe',
            icon: <PeopleIcon />,
            path: '/team',
            active: isActive('/team')
        },
        {
            text: 'Fichiers',
            icon: <FolderIcon />,
            path: '/files',
            active: isActive('/files')
        }
    ];

    const goToDashboard = () => {
        navigate('/');
        console.log('Navigation vers le tableau de bord');
    };

    return (
        <StyledDrawer
            variant="persistent"
            anchor="left"
            open={open}
            sx={{
                '& .MuiDrawer-paper': {
                    boxShadow: 'none',
                    border: 'none',
                    borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                },
            }}
        >
            <Box sx={{ overflow: 'auto', p: 2 }}>
                <List sx={{ p: 0 }}>
                    <ListItem disablePadding>
                        <ListItemButton 
                            onClick={goToDashboard}
                            sx={{ 
                                borderRadius: 2,
                                mb: 0.5,
                                bgcolor: isActive('/') || isActive('/dashboard') ? 'primary.light' : 'transparent',
                                color: isActive('/') || isActive('/dashboard') ? 'primary.main' : 'text.primary',
                                '&:hover': {
                                    bgcolor: (isActive('/') || isActive('/dashboard')) ? 'primary.light' : 'action.hover'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: (isActive('/') || isActive('/dashboard')) ? 'primary.main' : 'inherit', minWidth: 40 }}>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary={
                                    <Typography variant="body2" sx={{ fontWeight: (isActive('/') || isActive('/dashboard')) ? 600 : 400 }}>
                                        Tableau de bord
                                </Typography>
                                } 
                            />
                        </ListItemButton>
                            </ListItem>
                </List>

                <Divider sx={{ my: 1 }} />

                <List sx={{ p: 0 }}>
                    {menuItems.map((item) => (
                        <React.Fragment key={item.text}>
                            {item.submenu ? (
                                <>
                                    <ListItem disablePadding>
                            <ListItemButton
                                            onClick={item.handleClick}
                                sx={{
                                                borderRadius: 2,
                                                mb: 0.5,
                                                bgcolor: item.active ? 'primary.light' : 'transparent',
                                                color: item.active ? 'primary.main' : 'text.primary',
                                        '&:hover': {
                                                    bgcolor: item.active ? 'primary.light' : 'action.hover'
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: item.active ? 'primary.main' : 'inherit', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: item.active ? 600 : 400 }}>
                                                        {item.text}
                                                    </Typography>
                                                } 
                                            />
                                            {item.open ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                    </ListItem>
                                    <Collapse in={item.open} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding sx={{ pl: 4 }}>
                                            {item.items.map((subItem) => (
                                                <ListItem key={subItem.text} disablePadding>
                                                    <ListItemButton
                                                        onClick={() => navigate(subItem.path)}
                                                        sx={{ 
                                                            borderRadius: 2,
                                                            mb: 0.5,
                                                            bgcolor: subItem.active ? 'primary.light' : 'transparent',
                                                            color: subItem.active ? 'primary.main' : 'text.primary',
                                                            '&:hover': {
                                                                bgcolor: subItem.active ? 'primary.light' : 'action.hover'
                                                            }
                                                        }}
                                                    >
                                                        <ListItemText 
                                                            primary={
                                                                <Typography variant="body2" sx={{ fontWeight: subItem.active ? 600 : 400 }}>
                                                                    {subItem.text}
                                                                </Typography>
                                                            } 
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </>
                            ) : (
                                <ListItem disablePadding>
                                    <ListItemButton 
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            mb: 0.5,
                                            bgcolor: item.active ? 'primary.light' : 'transparent',
                                            color: item.active ? 'primary.main' : 'text.primary',
                                            '&:hover': {
                                                bgcolor: item.active ? 'primary.light' : 'action.hover'
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: item.active ? 'primary.main' : 'inherit', minWidth: 40 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={
                                                <Typography variant="body2" sx={{ fontWeight: item.active ? 600 : 400 }}>
                                                    {item.text}
                                                </Typography>
                                            } 
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </React.Fragment>
                    ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <List sx={{ p: 0 }}>
                    <ListItem disablePadding>
                        <ListItemButton 
                            onClick={() => navigate('/settings')}
                            sx={{ 
                                borderRadius: 2,
                                mb: 0.5,
                                bgcolor: isActive('/settings') ? 'primary.light' : 'transparent',
                                color: isActive('/settings') ? 'primary.main' : 'text.primary',
                                '&:hover': {
                                    bgcolor: isActive('/settings') ? 'primary.light' : 'action.hover'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive('/settings') ? 'primary.main' : 'inherit', minWidth: 40 }}>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary={
                                    <Typography variant="body2" sx={{ fontWeight: isActive('/settings') ? 600 : 400 }}>
                                        Paramètres
                                    </Typography>
                                } 
                            />
                            </ListItemButton>
                        </ListItem>
            </List>
            </Box>
        </StyledDrawer>
    );
}

export default Sidebar; 