const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// 🔐 MIDDLEWARES
// app.use(cors({
//   origin: [
//     'https://procly.net',
//     'https://www.procly.net',
//     'http://localhost:3000',
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   preflightContinue: false,
//   optionsSuccessStatus: 200
// }));

// DEBUG: Permitir cualquier origen temporalmente para debug de CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware para manejar OPTIONS preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚀 RUTAS BACKEND
app.use('/auth', require('./routes/auth'));
console.log('Ruta /auth montada');
app.use('/tickets', require('./routes/tickets'));
console.log('Ruta /tickets montada');
app.use('/stats', require('./routes/stats'));
console.log('Ruta /stats montada');

// 🌐 ARCHIVOS ESTATICOS DEL FRONTEND
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/components', express.static(path.join(__dirname, '../frontend/components')));

// 🏠 RUTAS DE LA LANDING PAGE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/landing/index.html'));
});

// 📱 RUTAS DE LA APLICACIÓN
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/app/index.html'));
});

app.get('/app/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/app/admin/administrador.html'));
});

app.get('/app/user/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/app/user/usuario.html'));
});

app.get('/app/auth/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/app/index.html'));
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

// 🚫 FALLBACK PARA RUTAS NO ENCONTRADAS
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/404.html'));
});

module.exports = app;
