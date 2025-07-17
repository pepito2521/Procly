// REDIRECCION INTELIGENTE DEL BOTON 'VOLVER AL INICIO'
document.addEventListener('DOMContentLoaded', function() {
  const isApp = window.location.pathname.includes('/app/');
  const volverBtn = document.getElementById('btn-volver-inicio');
  if (volverBtn) {
    volverBtn.href = isApp ? '/app/index.html' : '/landing/index.html';
  }
});

// ANIMACION LOTTI 404
document.addEventListener('DOMContentLoaded', function() {
  if (window.lottie && document.getElementById('lottie-404')) {
    lottie.loadAnimation({
      container: document.getElementById('lottie-404'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/404.json'
    });
  }
});
