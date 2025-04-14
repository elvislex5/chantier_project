import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper, 
    Container,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user } = useAuth();
    const navigate = useNavigate();
    
    // Si l'utilisateur est déjà connecté, rediriger vers le tableau de bord
    if (user) {
        return <Navigate to="/" />;
    }
    
    const handleContinue = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            // Tentative de connexion
            const success = await login({ username, password });
            
            if (success) {
                // Redirection vers la page d'accueil après connexion réussie
                console.log("Connexion réussie, redirection vers /");
                navigate('/');
            } else {
                setError('Identifiants incorrects');
            }
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Container maxWidth="sm">
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        width: '100%',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600 }}>
                        Connexion
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Connectez-vous pour accéder à votre espace
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleContinue}>
                        <TextField
                            label="Nom d'utilisateur"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isSubmitting}
                        />
                        
                        <TextField
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.2 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Se connecter'
                            )}
                        </Button>
                    </form>
                    
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Mot de passe oublié ? <Button color="primary" sx={{ p: 0, minWidth: 'auto' }}>Réinitialiser</Button>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default Login;