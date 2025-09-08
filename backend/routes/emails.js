const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  probarSistemaEmails,
  obtenerEstadisticasEmails,
  enviarEmailPartnerRecomendado
} = require('../controllers/emailController');

router.use(requireAuth);

// Ruta para probar el sistema de emails (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
      }

      const result = await probarSistemaEmails(email);
      
      if (result.success) {
        res.json({ 
          message: 'Email de prueba enviado correctamente',
          email,
          messageId: result.messageId
        });
      } else {
        res.status(500).json({ 
          error: 'Error enviando email de prueba',
          details: result.error 
        });
      }
    } catch (error) {
      console.error('Error en test de email:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  });
}

// Ruta para enviar email de partner recomendado
router.post('/partner-recomendado', async (req, res) => {
  try {
    const { partnerData, userEmail, userName } = req.body;
    
    if (!partnerData || !userEmail || !userName) {
      return res.status(400).json({ error: 'Datos requeridos faltantes' });
    }

    const result = await enviarEmailPartnerRecomendado(partnerData, userEmail, userName);
    
    if (result.success) {
      res.json({ 
        message: 'Email de confirmación enviado correctamente',
        email: userEmail
      });
    } else {
      res.status(500).json({ 
        error: 'Error enviando email de confirmación',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error en email de partner recomendado:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Ruta para obtener estadísticas de emails (futura implementación)
router.get('/stats', async (req, res) => {
  try {
    const stats = await obtenerEstadisticasEmails();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de emails:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router; 