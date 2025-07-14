async function esperarLottie() {
  let intentos = 0;
  while (!window.lottie && intentos < 20) {
    await new Promise(res => setTimeout(res, 100));
    intentos++;
  }
}

//MOSTRAR LOADER
export async function mostrarLoader() {
  if (!document.getElementById('loader')) {
    const res = await fetch('/components/loader.html');
    const html = await res.text();
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
    await esperarLottie();
    if (window.lottie) {
      window.lottie.loadAnimation({
        container: document.getElementById('loader-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/rocket.json',
      });
    }
  }
  document.body.classList.add('oculto');
  document.getElementById('loader').style.display = 'flex';
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