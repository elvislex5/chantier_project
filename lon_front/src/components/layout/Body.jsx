import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ children }) {
    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    bgcolor: '#ffffff',
                    minHeight: '100vh'
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default Layout; 