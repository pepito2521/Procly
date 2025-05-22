import { supabase } from './supabaseClient.js';

export async function cargarNavbar() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  const res = await fetch("../components/navbar.html");
  const html = await res.text();
  placeholder.innerHTML = html;

  inicializarDropdownNavbar();
  inicializarLogout();
}

function inicializarDropdownNavbar() {
  const dotsIcon = document.getElementById('menu-toggle');
  const dropdown = document.getElementById('dropdown-menu');

  if (!dotsIcon || !dropdown) return;

  dotsIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
}

function inicializarLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (!logoutBtn) return;

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

