// src/components/templates/TemplateList.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';  // Add this import
import {
  Container, Grid, Card, CardContent, CardActions, Typography,
  Button, Chip, Box, CircularProgress, FormControl, InputLabel,
  Select, MenuItem, TextField, InputAdornment
} from '@mui/material';
import { Search as SearchIcon, GetApp, Visibility } from '@mui/icons-material';
import { getAllTemplates, getTemplatesByCategory, searchTemplates } from '../../services/templates';

const categories = [
  'Todos', 'AI', 'Marketing', 'DevOps', 'Ventas', 
  'IT', 'Ingeniería', 'Finanzas', 'RRHH', 'Soporte'
];

export default function TemplateList({ openModal }) {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        let data;
        
        // Add connection status check
        if (!navigator.onLine) {
          throw new Error('offline');
        }
        
        if (category === 'Todos') {
          data = await getAllTemplates();
        } else {
          data = await getTemplatesByCategory(category);
        }
        
        setTemplates(data);
        setFilteredTemplates(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar las plantillas:', err);
        if (err.code === 400 || err.message.includes('Bad Request')) {
          // Handle Firebase connection error
          setError('Error de conexión con el servidor. Por favor, actualiza la página o inténtalo más tarde.');
        } else if (err.message === 'offline' || !navigator.onLine) {
          setError('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
        } else {
          setError('Error al cargar las plantillas. Por favor, inténtalo de nuevo más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Add event listeners for online/offline status
    const handleOnline = () => {
      setError(null);
      fetchTemplates();
    };

    const handleOffline = () => {
      setError('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchTemplates();

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [category]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredTemplates(templates);
      return;
    }
    
    try {
      const results = await searchTemplates(searchTerm);
      setFilteredTemplates(results);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      setFilteredTemplates(templates);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownload = async (templateId) => {
    if (!currentUser) {
      openModal('login');
      return;
    }
    
    if (!navigator.onLine) {
      // Show offline error message
      setError('No hay conexión a internet. Por favor, verifica tu conexión para descargar la plantilla.');
      return;
    }

    try {
      // Add your download implementation
      console.log('Downloading template:', templateId);
    } catch (error) {
      if (error.code === 'failed-precondition' || error.message.includes('offline')) {
        setError('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      } else {
        console.error('Error downloading template:', error);
        setError('Error al descargar la plantilla. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {error && (
        <Box sx={{ mb: 4 }}>
          <Typography color="error" variant="body1" align="center">
            {error}
          </Typography>
        </Box>
      )}
      <Typography variant="h4" component="h1" gutterBottom>
        Plantillas de Flujos de Trabajo
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Filtro por categoría */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="category-select-label">Categoría</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={category}
            label="Categoría"
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Búsqueda */}
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar plantillas"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button 
                  variant="contained" 
                  onClick={handleSearch}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <SearchIcon />
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Grid container spacing={3}>
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[6],
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {template.name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={template.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mr: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary" component="span">
                      {template.downloads} descargas
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    por {template.authorName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {template.description.length > 120 
                      ? `${template.description.substring(0, 120)}...` 
                      : template.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {template.tags && template.tags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </Box>
                </CardContent>
                // Remove the entire TemplateCard component from the bottom of the file
                // And keep the existing Material-UI implementation
                
                // For the download functionality in the existing Card component, modify the Button like this:
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<Visibility />} 
                    component={RouterLink}
                    to={`/templates/${template.id}`}
                  >
                    Ver
                  </Button>
                  {currentUser ? (
                    <Button 
                      size="small" 
                      color="primary" 
                      startIcon={<GetApp />}
                      onClick={() => handleDownload(template.id)}
                    >
                      Descargar
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<GetApp />}
                      onClick={() => openModal('login')}
                    >
                      Iniciar sesión para descargar
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Box sx={{ width: '100%', mt: 4, textAlign: 'center' }}>
            <Typography variant="h6">No se encontraron plantillas</Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
}

function TemplateCard({ template, openModal }) {  // Add openModal prop here
  const { currentUser } = useAuth();

  const handleDownload = () => {
    if (!currentUser) {
      // Mostrar modal de login
      return;
    }
    // Lógica de descarga
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-2">{template.title}</h3>
      <p className="text-gray-600 mb-4">{template.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{template.author}</span>
        {currentUser ? (
          <button 
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <i className="fas fa-download mr-2"></i>
            Descargar
          </button>
        ) : (
          <button 
            onClick={() => openModal('login')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Iniciar sesión para descargar
          </button>
        )}
      </div>
    </div>
  );
}
