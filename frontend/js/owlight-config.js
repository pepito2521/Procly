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
  // Pequeño delay para asegurar que Owlight esté cargado
  setTimeout(() => {
    if (window.Owlight) {
      window.initOwlight();
    }
  }, 1000);
});

// Exportar para uso en módulos ES6
export { window.owlightConfig, window.initOwlight, window.updateOwlightConfig, window.toggleOwlight, window.setOwlightLanguage };
