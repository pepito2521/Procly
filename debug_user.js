// Script de debugging para verificar el token y user_id
const jwt = require('jsonwebtoken');

// Función para decodificar el token
function debugToken(token) {
  try {
    const decoded = jwt.decode(token);
    console.log('🔍 Token decodificado:', {
      sub: decoded?.sub,
      email: decoded?.email,
      iat: decoded?.iat,
      exp: decoded?.exp,
      aud: decoded?.aud
    });
    return decoded;
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
}

// Función para verificar si el token está expirado
function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('❌ Error verificando expiración:', error);
    return true;
  }
}

module.exports = {
  debugToken,
  isTokenExpired
};
