import lottie from 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';

export async function cargarLoader() {
  document.body.classList.add("oculto");

  try {
    const res = await fetch('/components/loader.html');
    const html = await res.text();
    document.getElementById('loader-placeholder').innerHTML = html;

    // Cargar animación Lottie
    lottie.loadAnimation({
      container: document.getElementById('loader-animation'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/rocket.json',
    });

  } catch (error) {
    console.error('Error al cargar el loader:', error);
  }

  const esperarYOcultar = () => {
    const loader = document.getElementById("loader");
    if (loader) {
      setTimeout(() => {
        loader.classList.add("fade-out");
        setTimeout(() => {
          loader.style.display = "none";
          document.body.classList.remove("oculto");
        }, 500);
      }, 900);
    } else {
      document.body.classList.remove("oculto");
    }
  };

  if (document.readyState === "complete") {
    esperarYOcultar();
  } else {
    window.addEventListener("load", esperarYOcultar);
  }
}