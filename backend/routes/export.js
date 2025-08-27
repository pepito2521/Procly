const express = require('express');
const router = express.Router();
const { exportarTickets } = require('../controllers/exportController');

// POST /api/export/tickets - Exportar tickets a Excel
router.post('/tickets', exportarTickets);

module.exports = router;
