async function esperarLottie() {
  let intentos = 0;
  while (!window.lottie && intentos < 20) {
    await new Promise(res => setTimeout(res, 100));
    intentos++;
  }
  console.log("¿Lottie está disponible?", !!window.lottie);
  return !!window.lottie;
}

export async function mostrarLoader() {
  console.log("[Loader] mostrarLoader llamado");
  
  try {
    if (!document.getElementById('loader')) {
      console.log("[Loader] No existe #loader, cargando HTML...");
      const res = await fetch('/components/loader.html');
      if (!res.ok) {
        throw new Error(`Error cargando loader HTML: ${res.status}`);
      }
      const html = await res.text();
      const div = document.createElement('div');
      div.innerHTML = html;
      document.body.appendChild(div.firstElementChild);
    }
  
    const loader = document.getElementById('loader');
    const loaderAnimation = document.getElementById('loader-animation');
    const fallbackSpinner = document.getElementById('fallback-spinner');
    
    if (loader) {
      loader.style.display = 'flex';
      
      // Ocultar el contenedor de Lottie y mostrar directamente el fallback
      if (loaderAnimation) loaderAnimation.style.display = 'none';
      if (fallbackSpinner) fallbackSpinner.style.display = 'block';
      
      console.log("[Loader] Mostrando fallback spinner directamente");
    }
    
    document.body.classList.add('oculto');
    
  } catch (error) {
    console.error("[Loader] Error en mostrarLoader:", error);
    // En caso de error, mostrar un loader básico
    mostrarLoaderBasico();
  }
}

function mostrarFallbackSpinner() {
  console.log("[Loader] Mostrando fallback spinner");
  const loaderAnimation = document.getElementById('loader-animation');
  const fallbackSpinner = document.getElementById('fallback-spinner');
  
  if (loaderAnimation) loaderAnimation.style.display = 'none';
  if (fallbackSpinner) fallbackSpinner.style.display = 'block';
}

function mostrarLoaderBasico() {
  console.log("[Loader] Mostrando loader básico");
  // Crear un loader básico si todo falla
  const loaderBasico = document.createElement('div');
  loaderBasico.id = 'loader-basico';
  loaderBasico.className = 'glass-loader';
  loaderBasico.innerHTML = `
    <div class="spinner">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="36" stroke="#508991" stroke-width="4" stroke-linecap="round" stroke-dasharray="113.097" stroke-dashoffset="113.097">
          <animate attributeName="stroke-dashoffset" dur="1s" values="113.097;0;113.097" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  `;
  document.body.appendChild(loaderBasico);
  document.body.classList.add('oculto');
}

//OCULTAR LOADER
export function ocultarLoader() {
  console.log("[Loader] ocultarLoader llamado");
  document.body.classList.remove('oculto');
  
  const loader = document.getElementById('loader');
  const loaderBasico = document.getElementById('loader-basico');
  
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      loader.classList.remove('fade-out');
    }, 500);
  }
  
  if (loaderBasico) {
    loaderBasico.classList.add('fade-out');
    setTimeout(() => {
      loaderBasico.remove();
    }, 500);
  }
}

// FUNCIÓN DE PRUEBA PARA TESTEAR EL LOADER
export function testLoader() {
  console.log("[Loader] Iniciando test del loader...");
  mostrarLoader();
  
  setTimeout(() => {
    console.log("[Loader] Ocultando loader después de 3 segundos...");
    ocultarLoader();
  }, 3000);
}

// Hacer disponible para testing desde consola
window.testLoader = testLoader;