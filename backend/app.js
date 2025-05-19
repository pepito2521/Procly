const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// ENV
dotenv.config();

// INIT APP
const app = express();

// MIDDLEWARES
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RUTAS DE AUTENTICACIÓN
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

module.exports = app;
