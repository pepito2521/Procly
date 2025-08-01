const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// 🔐 MIDDLEWARES
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
app.use(cors({
  origin: [
    'https://procly.net',
    'https://www.procly.net',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔒 HEADERS DE SEGURIDAD
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 🚀 RUTAS BACKEND (¡SIEMPRE ANTES DEL CATCH-ALL!)
app.use('/auth', require('./routes/auth'));
app.use('/tickets', require('./routes/tickets'));
app.use('/stats', require('./routes/stats'));
app.use('/emails', require('./routes/emails'));


// 🌐 ARCHIVOS ESTÁTICOS DEL FRONTEND
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/components', express.static(path.join(__dirname, '../frontend/components')));

// 🏠 RUTAS DE LA LANDING PAGE Y APP
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/landing/index.html'));
});
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

// 🚫 CATCH-ALL: SIEMPRE AL FINAL
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/404.html'));
});

module.exports = app;
