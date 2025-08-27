const express = require('express');
const router = express.Router();
const { obtenerCategorias } = require('../controllers/categoriasController');

// GET /api/categorias - Obtener todas las categorías (público)
router.get('/', obtenerCategorias);

module.exports = router;
