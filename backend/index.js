const express = require('express');
const app = require('./app');
const PORT = process.env.PORT || 3000;

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
  const url = process.env.PORT ? `https://www.procly.net` : `http://localhost:${PORT}`;
  console.log(`Servidor corriendo en ${url}`);
});

