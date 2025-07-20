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
    ticketsTotales,
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
    tendenciaTicketsVsMesAnterior,
    porcentajeTicketsEntregados,
    porcentajeTicketsEnCurso,
    porcentajeTicketsCancelados,
    
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
router.get('/tickets-totales', ticketsTotales);
router.get('/tickets-procesados', ticketsTotales); // Alias para tickets-procesados
router.get('/gasto-mensual', gastoMensual);
router.get('/gastos-mensuales', gastosMensuales);
router.get('/promedio-mensual', promedioMensual);
router.get('/acumulado-anual', acumuladoAnual);
router.get('/mes-actual', (req, res) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const ahora = new Date();
  res.json({
    nombre: meses[ahora.getMonth()],
    numero: ahora.getMonth() + 1
  });
});

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
router.get('/tendencia-tickets-vs-mes-anterior', tendenciaTicketsVsMesAnterior);
router.get('/porcentaje-tickets-entregados', porcentajeTicketsEntregados);
router.get('/porcentaje-tickets-en-curso', porcentajeTicketsEnCurso);
router.get('/porcentaje-tickets-cancelados', porcentajeTicketsCancelados);

module.exports = router;
