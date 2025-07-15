const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { 
    crearTicket,
    obtenerDirecciones,
    obtenerTickets,
    obtenerTicketPorId,
    seleccionarPropuesta,
    kpiTotalTicketsUsuario,
    kpiTicketsEntregadosUsuario,
    kpiTicketsEnProcesoUsuario,
    kpiTicketsCanceladosUsuario
} = require('../controllers/ticketsController');


// RUTAS TICKETS
router.get('/direcciones', requireAuth, obtenerDirecciones);
router.post('/', requireAuth, crearTicket);
router.get('/', requireAuth, obtenerTickets);
router.get('/:id', requireAuth, obtenerTicketPorId);
router.post('/:id/seleccionar', requireAuth, seleccionarPropuesta);

// KPI USUARIO
router.get('/kpi-total', requireAuth, kpiTotalTicketsUsuario);
router.get('/kpi-entregados', requireAuth, kpiTicketsEntregadosUsuario);
router.get('/kpi-en-proceso', requireAuth, kpiTicketsEnProcesoUsuario);
router.get('/kpi-cancelados', requireAuth, kpiTicketsCanceladosUsuario);

module.exports = router;
