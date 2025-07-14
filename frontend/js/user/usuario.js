// NAVEGACION MODULAR
import { supabase } from "/js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
  const secciones = {
    nuevo_ticket: {
      nombre: "Nuevo Ticket",
      archivo: "nuevo_ticket.html",
      js: "/js/user/nuevo_ticket.js",
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus">
        <path d="M12 5v14"/><path d="M5 12h14"/>
      </svg>
      `
    },
    mis_tickets: {
      nombre: "Mis Tickets",
      archivo: "mis_tickets.html",
      js: "/js/user/mis_tickets.js",
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list">
        <path d="M12 20H2"/><path d="M12 4H2"/><path d="M20 12H4"/>
      </svg>
      `
    },
    manual: {
      nombre: "Manual",
      archivo: "manual.html",
      js: "/js/user/manual.js",
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book">
        <path d="M12 6h4l3 9H5L8 6z"/><path d="M15 6v12"/><path d="M9 6v12"/>
      </svg>
      `
    }
  };

  const dynamicContent = document.getElementById("dynamicContent");
  const pageTitle = document.getElementById("pageTitle");

  async function cargarSeccion(seccion) {
    const info = secciones[seccion];
    if (!info) return;
    try {
      const resp = await fetch(`/user/components/${info.archivo}`);
      const html = await resp.text();
      dynamicContent.innerHTML = html;
      pageTitle.textContent = info.nombre;
      document.getElementById("pageIcon").innerHTML = info.icon;
      marcarActivo(seccion);
      if (info.js) {
        import(info.js)
          .then(mod => {
            if (typeof mod.initDetalleTicket === 'function') mod.initDetalleTicket();
            // ...otros inits según la sección...
          })
          .catch(e => console.error("Error cargando JS de sección:", e));
      }
    } catch (e) {
      dynamicContent.innerHTML = `<p style='padding:2rem;'>No se pudo cargar la sección.</p>`;
    }
  }

  function marcarActivo(seccion) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === seccion);
    });
  }

  function inicializarSidebar() {
    document.getElementById("sidebarToggle")?.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });
  }

  function inicializarLogoutDirecto() {
    const logoutIcon = document.getElementById("logout-direct");

    if (!logoutIcon) return;

    logoutIcon.addEventListener("click", async () => {
      const { error } = await supabase.auth.signOut();
      localStorage.removeItem('supabaseToken');

      if (error) {
        alert("Error al cerrar sesión: " + error.message);
      } else {
        window.location.href = "/index.html";
      }
    });
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-section');
      cargarSeccion(seccion);
    });
  });

  // Cargar sección por defecto
  cargarSeccion('nuevo_ticket');
  inicializarSidebar();
  inicializarLogoutDirecto();
});

// Aquí puedes poner lógica global, listeners generales, utilidades, etc.
