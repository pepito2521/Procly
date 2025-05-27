const express = require('express');
const router = express.Router();
const { crearTicket } = require('../controllers/ticketsController');

// Ruta para crear un nuevo ticket
router.post('/', crearTicket);

module.exports = router;
