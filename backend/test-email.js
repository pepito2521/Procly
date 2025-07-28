const { probarSistemaEmails } = require('./controllers/emailController');
const { isEmailConfigured } = require('./utils/emailService');

async function testEmailSystem() {
  console.log('🧪 Probando sistema de emails...');
  console.log('📧 Email configurado:', isEmailConfigured);

  if (!isEmailConfigured) {
    console.log('❌ Sistema de emails no configurado');
    console.log('💡 Configura las variables de entorno:');
    console.log('   - RESEND_API_KEY');
    console.log('   - APP_URL (opcional)');
    console.log('   - ADMIN_EMAIL (opcional)');
    return;
  }

  const testEmail = 'test@example.com'; // Cambia por tu email para probar

  try {
    console.log('\n📨 Enviando email de prueba...');
    const result = await probarSistemaEmails(testEmail);
    
    if (result.success) {
      console.log('✅ Email de prueba enviado correctamente');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('❌ Error enviando email de prueba:', result.error);
    }

    console.log('\n🎉 Test de email completado!');

  } catch (error) {
    console.error('❌ Error en test de emails:', error.message);
  }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testEmailSystem();
}

module.exports = { testEmailSystem }; 