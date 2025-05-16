// index.js
const app = require('./app');

// Puerto desde .env o por defecto 3000
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
