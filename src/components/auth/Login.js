// src/components/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Button, TextField, Typography, Paper, 
  Container, Divider, Alert, CircularProgress 
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión: ' + err.message);
    }
    
    setLoading(false);
  }

  async function handleFacebookLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithFacebook();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión con Facebook: ' + err.message);
    }
    
    setLoading(false);
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Iniciar Sesión
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
          
          <Divider sx={{ my: 2 }}>o</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<FacebookIcon />}
            onClick={handleFacebookLogin}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Iniciar sesión con Facebook
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/reset-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                ¿Olvidaste tu contraseña?
              </Typography>
            </Link>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" component="span" color="primary">
                  Regístrate aquí
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
