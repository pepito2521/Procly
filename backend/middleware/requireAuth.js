const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const { data, error } = await supabase.auth.getUser(token);
    console.log('🔍 Resultado de validación:', { success: !error, user: !!data?.user, error: error?.message });

    if (error || !data?.user) {
      console.error('🛑 Error al validar token:', error);
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    console.log('✅ Token válido para usuario:', data.user.id);
    req.user = data.user;
    next();
  } catch (err) {
    console.error('💥 Error inesperado en requireAuth:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
