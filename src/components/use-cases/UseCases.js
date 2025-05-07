import React from 'react';
import { Container, Typography, Grid } from '@mui/material';

const UseCases = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Casos de Uso
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Descubre cómo la comunidad latina está utilizando n8n para automatizar sus procesos
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {/* Aquí puedes agregar los casos de uso específicos */}
      </Grid>
    </Container>
  );
};

export default UseCases;