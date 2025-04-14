import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './layout/Sidebar';
import Body from './layout/Body';
import SessionWarning from './SessionWarning';

function Layout({ children }) {
    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
                {children}
            </Box>
            <SessionWarning />
        </Box>
    );
}

export default Layout; 