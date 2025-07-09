const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { 
    crearTicket,
    obtenerDirecciones,
    obtenerTickets,
    obtenerTicketPorId,
    seleccionarPropuesta
} = require('../controllers/ticketsController');


// RUTAS
router.get('/direcciones', requireAuth, obtenerDirecciones);
router.post('/', requireAuth, crearTicket);
router.get('/', requireAuth, obtenerTickets);
router.get('/:id', requireAuth, obtenerTicketPorId);
router.post('/:id/seleccionar', requireAuth, seleccionarPropuesta);

module.exports = router;
