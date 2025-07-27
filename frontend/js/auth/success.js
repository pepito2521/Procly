// CARGAR LA ANIMACION LOTTIE
document.addEventListener('DOMContentLoaded', function() {
    lottie.loadAnimation({
        container: document.getElementById('success-animation'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: '/assets/lottie/success-check.json'
    });
});