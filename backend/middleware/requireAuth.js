const jwt = require('jsonwebtoken');

module.exports = async function requireAuth(req, res, next) {
  console.log('🔐 Middleware requireAuth ejecutándose para:', req.path);
  console.log('📋 Headers recibidos:', req.headers);
  
  const authHeader = req.headers.authorization;
  console.log('🔑 Auth header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No hay token de autorización');
    return res.status(401).json({ error: 'Token de autorización no encontrado' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🎫 Token extraído:', token.substring(0, 20) + '...');

  try {
    // Decodificar el token JWT directamente para obtener el user_id
    const decoded = jwt.decode(token);
    console.log('🔍 Token decodificado:', { sub: decoded?.sub, email: decoded?.email });

    if (!decoded || !decoded.sub) {
      console.error('🛑 Token inválido o sin sub claim');
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    // Crear un objeto user con el ID extraído del token
    const user = {
      id: decoded.sub,
      email: decoded.email
    };
    
    console.log('✅ Token válido para usuario:', user.id);
    req.user = user;
    next();
  } catch (err) {
    console.error('💥 Error inesperado en requireAuth:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
