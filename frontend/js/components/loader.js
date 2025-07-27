// LOADER SIMPLE Y FUNCIONAL

export function mostrarLoader() {
  console.log("[Loader] mostrarLoader llamado");
  
  let loader = document.getElementById('loader');
  
  // Si no existe el loader, lo creamos
  if (!loader) {
    console.log("[Loader] Creando loader...");
    loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'simple-loader';
    loader.innerHTML = `
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="loading-text">Cargando...</p>
      </div>
    `;
    document.body.appendChild(loader);
    console.log("[Loader] Loader creado y agregado al DOM");
  }
  
  // Mostrar el loader
  loader.classList.add('show');
  console.log("[Loader] Loader mostrado correctamente");
}

export function ocultarLoader() {
  console.log("[Loader] ocultarLoader llamado");
  
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.remove('show');
    console.log("[Loader] Loader ocultado correctamente");
  }
}

// FUNCIÓN DE PRUEBA
export function testLoader() {
  console.log("[Loader] Iniciando test del loader...");
  mostrarLoader();
  
  setTimeout(() => {
    console.log("[Loader] Ocultando loader después de 3 segundos...");
    ocultarLoader();
  }, 3000);
}

// FUNCIÓN DE PRUEBA MÁS LARGA
export function testLoaderLargo() {
  console.log("[Loader] Iniciando test largo del loader (5 segundos)...");
  mostrarLoader();
  
  setTimeout(() => {
    console.log("[Loader] Ocultando loader después de 5 segundos...");
    ocultarLoader();
  }, 5000);
}

// Hacer disponibles para testing desde consola
window.testLoader = testLoader;
window.testLoaderLargo = testLoaderLargo;