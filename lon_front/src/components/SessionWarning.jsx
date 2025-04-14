import { Snackbar, Button } from '@mui/material';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

function SessionWarning() {
    const { showWarning, extendSession } = useSessionTimeout();

    return (
        <Snackbar
            open={showWarning}
            message="Votre session va expirer dans 5 minutes"
            action={
                <Button 
                    color="primary" 
                    size="small" 
                    onClick={extendSession}
                >
                    Prolonger la session
                </Button>
            }
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
    );
}

export default SessionWarning; 