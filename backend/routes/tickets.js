const express = require('express');
const router = express.Router();
const { 
    crearTicket,
    obtenerDirecciones,
    obtenerTickets,
    obtenerTicketPorId
} = require('../controllers/ticketsController');
const requireAuth = require('../middleware/requireAuth');


// RUTAS
router.get('/direcciones', requireAuth, obtenerDirecciones);
router.post('/', requireAuth, crearTicket);
router.get('/', requireAuth, obtenerTickets);
router.get('/:id', requireAuth, obtenerTicketPorId);

module.exports = router;
