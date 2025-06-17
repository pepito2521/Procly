import { supabase } from './supabaseClient.js';

export async function cargarNavbar() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  const res = await fetch("/components/navbar.html");
  const html = await res.text();
  placeholder.innerHTML = html;

  inicializarLogoutDirecto();
  resaltarLinkActivo();
}

// FUNCION: INICIALIZAR LOGOUT DESDE ICONO
function inicializarLogoutDirecto() {
  const logoutIcon = document.getElementById("logout-direct");

  if (!logoutIcon) return;

  logoutIcon.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Error al cerrar sesión: " + error.message);
    } else {
      window.location.href = "/index.html";
    }
  });
}

// FUNCION: RESALTAR LINK ACTIVO
function resaltarLinkActivo() {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".navbar-links a");

  links.forEach(link => {
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}


