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
  gastoPromedioMensual
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

module.exports = router;
