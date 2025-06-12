const express = require('express');
const app = require('./app');
const PORT = process.env.PORT || 3000;

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

