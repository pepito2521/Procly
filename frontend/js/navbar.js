import { supabase } from './supabaseClient.js';

function inicializarDropdownNavbar() {
  const dotsIcon = document.querySelector('.navbar-user img[alt="Icono tres puntos"]');
  const dropdown = document.getElementById('dropdown-menu');

  if (!dotsIcon || !dropdown) return;

  // MOSTRAR/OCULTAR EL DROPDOWN
  dotsIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // OCULTAR DROPDOWN AL HACER CLIC FUERA
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
}

function inicializarLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Error al cerrar sesión: " + error.message);
      } else {
        window.location.href = "/index.html";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarDropdownNavbar();
  inicializarLogout();
});
