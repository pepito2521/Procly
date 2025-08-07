const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// 🔐 MIDDLEWARES Y REDIRECCIONES
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const host = req.header('host');
    const protocol = req.header('x-forwarded-proto') || req.protocol;
    if (protocol !== 'https') {
      return res.redirect(`https://${host}${req.url}`);
    }
    if (!host.includes('www.')) {
      return res.redirect(`https://www.procly.net${req.url}`);
    }
    next();
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

// 🔒 HEADERS DE SEGURIDAD Y SEO
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  res.setHeader('X-Robots-Tag', 'index, follow');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  if (req.path === '/robots.txt') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
  
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

// 📄 RUTAS PARA ARCHIVOS IMPORTANTES
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, '../frontend/public/sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, '../frontend/public/robots.txt'));
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
  if (req.path === '/robots.txt') {
    res.status(404).setHeader('Content-Type', 'text/plain');
    return res.send('User-agent: *\nDisallow: /');
  }
  
  res.sendFile(path.join(__dirname, '../frontend/public/404.html'));
});

// 🛠️ MANEJO DE ERRORES
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (req.path === '/robots.txt') {
    res.status(500).setHeader('Content-Type', 'text/plain');
    return res.send('User-agent: *\nDisallow: /');
  }
  
  res.status(500).send('Error interno del servidor');
});

module.exports = app;
