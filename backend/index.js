const express = require('express');
const app = require('./app');
const path = require('path')

const PORT = process.env.PORT || 3000;

// SERVIR ARCHIVOS ESTATICOS DE FRONTEND (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));




// REDIRIGIR LA RAÍZ AL INDEX.HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
