const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend estático
app.use(express.static(path.join(__dirname, '../public')));

// Montar rutas de la API
app.use('/api/contacts', contactRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

module.exports = app;