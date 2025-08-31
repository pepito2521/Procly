// Configuración global de Owlight para Procly
// Este archivo centraliza la configuración del widget de feedback

window.owlightConfig = {
  // Idioma en español
  language: 'es',
  
  // Posición del widget (bottom-right, bottom-left, top-right, top-left)
  position: 'bottom-right',
  
  // Tema del widget (light, dark)
  theme: 'light',
  
  // Información de la empresa
  company: 'Procly',
  
  // Colores personalizados que coinciden con la identidad visual de Procly
  primaryColor: '#508991',    // Color principal de Procly
  textColor: '#374151',       // Color del texto
  backgroundColor: '#ffffff',  // Color de fondo
  
  // Configuración adicional
  showBranding: false,        // Ocultar branding de Owlight
  autoInit: true,             // Inicializar automáticamente
  
  // Personalización de textos en español
  translations: {
    es: {
      feedback: 'Feedback',
      problems: 'Problemas',
      suggestions: 'Sugerencias',
      comments: 'Comentarios',
      submit: 'Enviar',
      cancel: 'Cancelar',
      thankYou: '¡Gracias por tu feedback!',
      placeholder: 'Cuéntanos qué piensas...'
    }
  }
};

// Función para inicializar Owlight manualmente si es necesario
window.initOwlight = function() {
  if (window.Owlight && window.Owlight.init) {
    window.Owlight.init(window.owlightConfig);
  }
};

// Función para cambiar la configuración dinámicamente
window.updateOwlightConfig = function(newConfig) {
  Object.assign(window.owlightConfig, newConfig);
  if (window.Owlight && window.Owlight.updateConfig) {
    window.Owlight.updateConfig(window.owlightConfig);
  }
};

// Función para mostrar/ocultar el widget
window.toggleOwlight = function(show = true) {
  if (window.Owlight && window.Owlight.toggle) {
    window.Owlight.toggle(show);
  }
};

// Función para cambiar el idioma dinámicamente
window.setOwlightLanguage = function(lang) {
  if (window.Owlight && window.Owlight.setLanguage) {
    window.Owlight.setLanguage(lang);
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM listo, inicializando Owlight...');
  
  // Función para verificar si Owlight está disponible
  function checkOwlight() {
    if (window.Owlight && window.Owlight.init) {
      console.log('✅ Owlight detectado, inicializando...');
      window.initOwlight();
      return true;
    } else if (window.owlight && window.owlight.init) {
      console.log('✅ Owlight (alternativo) detectado, inicializando...');
      window.initOwlight();
      return true;
    }
    return false;
  }
  
  // Función para detectar el contexto de la aplicación
  function detectAppContext() {
    const currentUrl = window.location.href;
    let context = 'Aplicación';
    
    if (currentUrl.includes('administrador.html')) {
      context = 'Panel de Administración';
      console.log('🎯 Contexto detectado: Panel de Administración');
    } else if (currentUrl.includes('usuario.html')) {
      context = 'Panel de Usuario';
      console.log('🎯 Contexto detectado: Panel de Usuario');
    } else if (currentUrl.includes('landing')) {
      context = 'Landing Page';
      console.log('🎯 Contexto detectado: Landing Page');
    }
    
    return context;
  }
  
  // Función para aplicar configuración específica del contexto
  function applyContextConfig(context) {
    if (window.updateOwlightConfig) {
      const config = {
        product: context,
        position: 'bottom-right'
      };
      
      // Configuraciones específicas por contexto
      if (context === 'Panel de Administración') {
        config.theme = 'light';
        config.primaryColor = '#508991';
      } else if (context === 'Panel de Usuario') {
        config.theme = 'light';
        config.primaryColor = '#508991';
      } else if (context === 'Landing Page') {
        config.position = 'bottom-left';
        config.theme = 'light';
      }
      
      console.log('⚙️ Aplicando configuración para:', context, config);
      window.updateOwlightConfig(config);
    }
  }
  
  // Intentar inicializar inmediatamente
  if (!checkOwlight()) {
    console.log('⏳ Owlight no está listo, esperando...');
    
    // Reintentos con intervalos crecientes
    let attempts = 0;
    const maxAttempts = 5; // Reducir intentos
    const checkInterval = setInterval(() => {
      attempts++;
      console.log(`🔄 Intento ${attempts}/${maxAttempts} de inicializar Owlight...`);
      
      if (checkOwlight()) {
        clearInterval(checkInterval);
        console.log('✅ Owlight inicializado exitosamente');
        
        // Aplicar configuración específica del contexto
        const context = detectAppContext();
        applyContextConfig(context);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('⚠️ Owlight no disponible, continuando sin widget de feedback');
        // No mostrar error, solo continuar sin el widget
      }
    }, 1000); // Aumentar intervalo
  } else {
    // Si Owlight ya está disponible, aplicar configuración inmediatamente
    const context = detectAppContext();
    applyContextConfig(context);
  }
});

// Las funciones ya están disponibles globalmente en window
// No es necesario exportar para scripts cargados con <script> tag
