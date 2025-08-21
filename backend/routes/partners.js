const express = require('express');
const router = express.Router();
const { registrarPartner, obtenerPartners, actualizarEstadoPartner, uploadBrochure } = require('../controllers/partnersController');

// POST /api/partners/registrar - Registrar nuevo partner
router.post('/registrar', uploadBrochure, registrarPartner);

// GET /api/partners - Obtener todos los partners (para admin)
router.get('/', obtenerPartners);

// PUT /api/partners/:id/estado - Actualizar estado de partner (para admin)
router.put('/:id/estado', actualizarEstadoPartner);

module.exports = router;
