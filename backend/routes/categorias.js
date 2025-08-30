const express = require('express');
const router = express.Router();
const { obtenerCategorias, actualizarEstadoCategoria } = require('../controllers/categoriasController');
const requireAuth = require('../middleware/requireAuth');

// GET /api/categorias - Obtener todas las categorías (público)
router.get('/', obtenerCategorias);

// PUT /api/categorias/:id/estado - Actualizar estado de categoría (requiere autenticación)
router.put('/:id/estado', requireAuth, actualizarEstadoCategoria);

module.exports = router;
