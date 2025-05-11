document.addEventListener('DOMContentLoaded', () => {
    const dotsIcon = document.querySelector('.navbar-user img[alt="Icono tres puntos"]');
    const dropdown = document.getElementById('dropdown-menu');
  
    dotsIcon.addEventListener('click', (e) => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      e.stopPropagation(); // evita que se cierre inmediatamente
    });
  
    // Cierra el menú si se hace clic fuera
    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });
  });