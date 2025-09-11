document.addEventListener('DOMContentLoaded', function() {
    
    const container = document.getElementById('success-animation');
    if (!container) {
        console.error('❌ No se encontró el contenedor #success-animation');
        return;
    }
    container.innerHTML = '';
    
    try {
        const animation = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: '/assets/lottie/success-check.json'
        });
        
        animation.addEventListener('DOMLoaded', function() {
        });
        
        animation.addEventListener('error', function(error) {
            console.error('❌ Error cargando animación Lottie:', error);
            container.innerHTML = '<div style="width: 100%; height: 100%; background: #3E8914; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">✓</div>';
        });
        
    } catch (error) {
        console.error('❌ Error al inicializar Lottie:', error);
        container.innerHTML = '<div style="width: 100%; height: 100%; background: #3E8914; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">✓</div>';
    }
});