async function esperarLottie() {
  let intentos = 0;
  while (!window.lottie && intentos < 20) {
    await new Promise(res => setTimeout(res, 100));
    intentos++;
  }
  console.log("¿Lottie está disponible?", !!window.lottie);
}

//MOSTRAR LOADER
export async function mostrarLoader() {
  console.log("[Loader] mostrarLoader llamado");
  if (!document.getElementById('loader')) {
    console.log("[Loader] No existe #loader, cargando HTML...");
    const res = await fetch('/components/loader.html');
    const html = await res.text();
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
    console.log("[Loader] loader.html insertado en el DOM");
    await esperarLottie();
    if (window.lottie) {
      console.log("[Loader] Lottie disponible, cargando animación...");
      window.lottie.loadAnimation({
        container: document.getElementById('loader-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/rocket.json',
      });
    } else {
      console.warn("[Loader] Lottie NO disponible");
    }
  }
  document.body.classList.add('oculto');
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'flex';
    console.log("[Loader] Loader visible");
  } else {
    console.error("[Loader] No se encontró #loader en el DOM");
  }
}

//OCULTAR LOADER
export function ocultarLoader() {
  document.body.classList.remove('oculto');
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      loader.classList.remove('fade-out');
    }, 500);
  }
}