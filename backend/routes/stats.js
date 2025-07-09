const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  direccionesTotales,
  direcciones,
  ticketsProcesados,
  gastoMensual,
  promedioMensual,
  acumuladoAnual,
  usuarios,
  totalUsuarios,
  usuariosActivos,
  gastoPromedioMensual,
  actividadTickets,
  ticketsEntregados,
  ticketsEnProceso,
  ticketsCancelados
} = require('../controllers/statsController');

router.use(requireAuth);

// KPI: DIRECCIONES
router.get('/direcciones-totales', direccionesTotales);
router.get('/direcciones', direcciones);

// KPI: DASHBOARD
router.get('/tickets-procesados', ticketsProcesados);
router.get('/gasto-mensual', gastoMensual);
router.get('/promedio-mensual', promedioMensual);
router.get('/acumulado-anual', acumuladoAnual);

// KPI: USUARIOS
router.get('/usuarios', usuarios);
router.get('/usuarios-totales', totalUsuarios);
router.get('/usuarios-activos', usuariosActivos);
router.get('/gasto-promedio-mensual', gastoPromedioMensual);

// KPI: ACTIVIDADES
router.get('/actividad-tickets', actividadTickets);
router.get('/tickets-entregados', ticketsEntregados);
router.get('/tickets-en-proceso', ticketsEnProceso);
router.get('/tickets-cancelados', ticketsCancelados);

module.exports = router;
