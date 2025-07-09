const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  direccionesTotales,
  direcciones,
  ticketsProcesados,
  gastoMensual,
  promedioMensual,
  acumuladoAnual
} = require('../controllers/statsController');

// Asegurarse de que todas las rutas usan autenticación
router.use(requireAuth);

// KPI: DIRECCIONES
router.get('/direcciones-totales', direccionesTotales);
router.get('/direcciones', direcciones);

// KPI: DASHBOARD
router.get('/tickets-procesados', ticketsProcesados);
router.get('/gasto-mensual', gastoMensual);
router.get('/promedio-mensual', promedioMensual);
router.get('/acumulado-anual', acumuladoAnual);

module.exports = router;
