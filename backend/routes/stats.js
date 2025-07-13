const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {

    // DIRECCIONES
    direccionesTotales,
    getDireccionesActivas,
    getDireccionesBloqueadas,
    direcciones,
    eliminarDireccion,
    editarDireccion,
    crearDireccion,

    // DASHBOARD
    ticketsProcesados,
    gastoMensual,
    gastosMensuales,
    promedioMensual,
    acumuladoAnual,

    // USUARIOS
    usuarios,
    usuariosNuevosEsteMes,
    totalUsuarios,
    usuariosActivos,
    porcentajeUsuariosActivos,
    gastoTotalPorUsuario,
    usuariosBloqueados,
    porcentajeUsuariosBloqueados,

    // ACTIVIDAD
    actividadTickets,
    ticketsEntregados,
    ticketsEnProceso,
    ticketsCancelados,
    
} = require('../controllers/statsController');

router.use(requireAuth);

// KPI: DIRECCIONES
router.get('/direcciones-totales', direccionesTotales);
router.get('/direcciones', direcciones);
router.get('/direcciones-activas', getDireccionesActivas);
router.get('/direcciones-bloqueadas', getDireccionesBloqueadas);
router.delete('/direcciones/:id', eliminarDireccion);
router.put('/direcciones/:id', editarDireccion);
router.post('/direcciones', crearDireccion);

// KPI: DASHBOARD
router.get('/tickets-procesados', ticketsProcesados);
router.get('/gasto-mensual', gastoMensual);
router.get('/gastos-mensuales', gastosMensuales);
router.get('/promedio-mensual', promedioMensual);
router.get('/acumulado-anual', acumuladoAnual);

// KPI: USUARIOS
router.get('/usuarios', usuarios);
router.get('/usuarios-nuevos-mes', usuariosNuevosEsteMes);
router.get('/usuarios-totales', totalUsuarios);
router.get('/usuarios-activos', usuariosActivos);
router.get('/usuarios-activos-porcentaje', porcentajeUsuariosActivos);
router.get('/gasto-promedio-mensual', promedioMensual);
router.get('/usuarios-gasto-total', gastoTotalPorUsuario);
router.get('/usuarios-bloqueados', usuariosBloqueados);
router.get('/usuarios-bloqueados-porcentaje', porcentajeUsuariosBloqueados);

// KPI: ACTIVIDADES
router.get('/actividad-tickets', actividadTickets);
router.get('/tickets-entregados', ticketsEntregados);
router.get('/tickets-en-proceso', ticketsEnProceso);
router.get('/tickets-cancelados', ticketsCancelados);

module.exports = router;
