// LOADER SIMPLE Y FUNCIONAL

export function mostrarLoader() {
  let loader = document.getElementById('loader');
  
  // Si no existe el loader, lo creamos
  if (!loader) {
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
  }
  
  // Mostrar el loader
  loader.classList.add('show');
}

export function ocultarLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.remove('show');
  }
}