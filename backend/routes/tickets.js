const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
    crearTicket,
    actualizarEstadoTicket,
    obtenerDirecciones,
    obtenerTickets,
    obtenerTicketPorId,
    seleccionarPropuesta,
    kpiTotalTicketsUsuario,
    kpiTicketsEntregadosUsuario,
    kpiTicketsEnProcesoUsuario,
    kpiTicketsCanceladosUsuario,
    kpiGastoTotalUsuario,
    kpiLimiteGastoUsuario,
    kpiSaldoDisponibleUsuario
} = require('../controllers/ticketsController');

router.use(requireAuth);

// RUTAS KPI USUARIO
router.get('/kpi-total', kpiTotalTicketsUsuario);
router.get('/kpi-entregados', kpiTicketsEntregadosUsuario);
router.get('/kpi-en-proceso', kpiTicketsEnProcesoUsuario);
router.get('/kpi-cancelados', kpiTicketsCanceladosUsuario);
router.get('/kpi-gasto', kpiGastoTotalUsuario);
router.get('/kpi-limite', kpiLimiteGastoUsuario);
router.get('/kpi-saldo', kpiSaldoDisponibleUsuario);

// RUTAS TICKETS
router.get('/direcciones', obtenerDirecciones);
router.post('/', crearTicket);
router.put('/estado', actualizarEstadoTicket);
router.get('/', obtenerTickets);
router.get('/:id', obtenerTicketPorId);
router.post('/:id/seleccionar', seleccionarPropuesta);

// DEBUG: Verificar user_id (temporal)
router.get('/debug/user', (req, res) => {
  console.log('🔍 Debug user_id:', req.user);
  res.json({ 
    user_id: req.user?.id,
    email: req.user?.email,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
