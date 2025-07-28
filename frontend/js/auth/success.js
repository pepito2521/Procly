// CARGAR LA ANIMACION LOTTIE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Cargando animación Lottie...');
    
    const container = document.getElementById('success-animation');
    if (!container) {
        console.error('❌ No se encontró el contenedor #success-animation');
        return;
    }
    
    console.log('📦 Contenedor encontrado:', container);
    console.log('📏 Dimensiones del contenedor:', container.offsetWidth, 'x', container.offsetHeight);
    
    // Limpiar el contenedor antes de cargar Lottie
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
            console.log('✅ Animación Lottie cargada exitosamente');
            console.log('📏 Dimensiones del SVG:', container.querySelector('svg')?.offsetWidth, 'x', container.querySelector('svg')?.offsetHeight);
        });
        
        animation.addEventListener('error', function(error) {
            console.error('❌ Error cargando animación Lottie:', error);
            // Mostrar fallback si hay error
            container.innerHTML = '<div style="width: 100%; height: 100%; background: #3E8914; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">✓</div>';
        });
        
    } catch (error) {
        console.error('❌ Error al inicializar Lottie:', error);
        // Mostrar fallback si hay error
        container.innerHTML = '<div style="width: 100%; height: 100%; background: #3E8914; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">✓</div>';
    }
});