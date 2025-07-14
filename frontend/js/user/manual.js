// frontend/js/user/manual.js

export function initManual() {
  // Aquí va la lógica para inicializar el manual de usuario

  // Ejemplo: Si tienes botones de acordeón en el manual
  document.querySelectorAll('.acordeon-titulo').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('abierto');
      const contenido = btn.nextElementSibling;
      if (contenido) {
        contenido.style.display = contenido.style.display === 'block' ? 'none' : 'block';
      }
    });
  });

  // Si necesitas cargar datos dinámicamente, hazlo aquí
  // Por ejemplo, fetch de preguntas frecuentes, etc.
}
