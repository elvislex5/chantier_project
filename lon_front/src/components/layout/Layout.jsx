import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

// Largeur du menu latéral
const DRAWER_WIDTH = 240;

// Style pour le contenu principal
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${DRAWER_WIDTH}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    // Supprimer toute marge ou bordure qui pourrait créer un espace
    borderLeft: 'none',
    // Assurer que le contenu est collé au menu
    position: 'relative',
    backgroundColor: theme.palette.background.default,
  }),
);

function Layout({ children }) {
    const [open, setOpen] = useState(true);
    
    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            <Navbar open={open} handleDrawerToggle={handleDrawerToggle} />
            <Sidebar open={open} handleDrawerToggle={handleDrawerToggle} />
            <Main open={open}>
                <Toolbar /> {/* Espace pour compenser la barre de navigation fixe */}
                <Box 
                    sx={{ 
                        // Supprimer tout padding ou marge qui pourrait créer un espace
                        p: 0, 
                        m: 0,
                        // Assurer que le contenu est collé au menu
                        position: 'relative',
                        // Supprimer toute bordure qui pourrait créer une ligne
                        border: 'none',
                        borderLeft: 'none',
                        // Assurer que le contenu remplit tout l'espace disponible
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {children || <Outlet />}
                </Box>
            </Main>
        </Box>
    );
}

export default Layout; 