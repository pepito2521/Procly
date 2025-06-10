const express = require('express');
const router = express.Router();
const { 
    crearTicket,
    obtenerDirecciones 
} = require('../controllers/ticketsController');
const requireAuth = require('../middleware/requireAuth');


// RUTAS
router.get('/direcciones', requireAuth, obtenerDirecciones);
router.post('/', requireAuth, crearTicket);


module.exports = router;
