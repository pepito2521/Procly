// Configuración de variables de entorno para emails
module.exports = {
  // Resend SMTP Configuration
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  
  // Application URLs
  APP_URL: process.env.APP_URL || 'https://procly.net',
  
  // Admin email for notifications
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  
  // Email sender configuration
  EMAIL_FROM: 'notificaciones@procly.net',
  
  // Validate required environment variables
  validateConfig: () => {
    const required = ['RESEND_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Variables de entorno faltantes para emails:', missing);
      console.warn('📧 Los emails no se enviarán hasta que se configuren estas variables');
      return false;
    }
    
    return true;
  }
}; 