const express = require('express');
const app = require('./app');
const path = require('path')

const PORT = process.env.PORT || 3000;

// SERVIR ARCHIVOS ESTATICOS DE FRONTEND/PUBLIC
app.use(express.static(path.join(__dirname, '../frontend/public')));


// REDIRIGIR LA RAÍZ AL INDEX.HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
