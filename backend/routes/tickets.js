const express = require('express');
const router = express.Router();
const { 
    crearTicket,
    obtenerDirecciones 
} = require('../controllers/ticketsController');

// RUTAS
router.get('/direcciones', obtenerDirecciones);
router.post('/', crearTicket);

module.exports = router;
