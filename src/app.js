const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middlewares globales
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (carpeta public)
app.use(express.static(path.join(__dirname, '../public')));

// Ruta de prueba inicial / estado del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Importar y usar rutas 
try {
  const contactRoutes = require('./routes/contactRoutes');
  app.use('/api/contacts', contactRoutes);
} catch (error) {
  // Manejo preventivo si las rutas aún están vacías
  console.log('Esperando implementación de contactRoutes...');
}

module.exports = app;