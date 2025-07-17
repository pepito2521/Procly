const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// 🔐 MIDDLEWARES
app.use(cors({
  origin: [
    'https://procly.net',
    'https://www.procly.net',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚀 RUTAS BACKEND
app.use('/auth', require('./routes/auth'));
app.use('/tickets', require('./routes/tickets'));
app.use('/stats', require('./routes/stats'));

// 🌐 ARCHIVOS ESTATICOS DEL FRONTEND
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/components', express.static(path.join(__dirname, '../frontend/components')));

// 🏠 LANDING PAGE (PÁGINA PRINCIPAL)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/landing/index.html'));
});

// 📱 APLICACIÓN WEB
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/app/index.html'));
});

app.get('/app/*', (req, res) => {
  const filePath = path.join(__dirname, '../frontend/public', req.path);
  res.sendFile(filePath);
});

// 🚫 FALLBACK - PÁGINA 404
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/404.html'));
});

module.exports = app;
