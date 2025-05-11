document.addEventListener('DOMContentLoaded', () => {
    const dotsIcon = document.querySelector('.navbar-user img[alt="Icono tres puntos"]');
    const dropdown = document.getElementById('dropdown-menu');
  
    if (!dotsIcon || !dropdown) return;
  
    dotsIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  
    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });
  });