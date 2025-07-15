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

router.use(requireAuth);

// RUTAS KPI USUARIO
router.get('/kpi-total', kpiTotalTicketsUsuario);
router.get('/kpi-entregados', kpiTicketsEntregadosUsuario);
router.get('/kpi-en-proceso', kpiTicketsEnProcesoUsuario);
router.get('/kpi-cancelados', kpiTicketsCanceladosUsuario);

// RUTAS TICKETS
router.get('/direcciones', obtenerDirecciones);
router.post('/', crearTicket);
router.get('/', obtenerTickets);
router.get('/:id', obtenerTicketPorId);
router.post('/:id/seleccionar', seleccionarPropuesta);

module.exports = router;
