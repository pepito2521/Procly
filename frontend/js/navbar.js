import { supabase } from './supabaseClient.js';

export async function cargarNavbar() {
  await cargarNavbarDesdeArchivo("/components/navbar.html");
}
export async function cargarNavbarAdmin() {
  await cargarNavbarDesdeArchivo("/components/navbar_admin.html");
}
export async function cargarNavbarProclier() {
  await cargarNavbarDesdeArchivo("/components/navbar_proclier.html");
}

// FUNCION GENERAL PARA CARGAR NAVBARS
async function cargarNavbarDesdeArchivo(ruta) {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  const res = await fetch(ruta);
  const html = await res.text();
  placeholder.innerHTML = html;

  inicializarLogoutDirecto();
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


