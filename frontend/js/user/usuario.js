// NAVEGACION MODULAR
import { supabase } from "/js/supabaseClient.js";
import { mostrarLoader, ocultarLoader } from "/js/components/loader.js";

document.addEventListener("DOMContentLoaded", () => {
  const secciones = {
    nuevo_ticket: {
      nombre: "Nuevo Ticket",
      archivo: "nuevo_ticket.html",
      js: "/js/user/nuevo_ticket.js",
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
      </svg>
      `
    },
    mis_tickets: {
      nombre: "Mis Tickets",
      archivo: "mis_tickets.html",
      js: "/js/user/mis_tickets.js",
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,72h72a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm88,48H40a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16Zm109.66,13.66a8,8,0,0,1-11.32,0L206,177.36A40,40,0,1,1,217.36,166l20.3,20.3A8,8,0,0,1,237.66,197.66ZM184,168a24,24,0,1,0-24-24A24,24,0,0,0,184,168Z"></path>
      </svg>
      `
    },
    manual: {
      nombre: "Manual",
      archivo: "manual.html",
      js: "/js/user/manual.js",
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"></path>
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
      await mostrarLoader();

      const resp = await fetch(`/app/user/components/${info.archivo}`);
      const html = await resp.text();
      dynamicContent.innerHTML = html;
      pageTitle.textContent = info.nombre;
      document.getElementById("pageIcon").innerHTML = info.icon;
      marcarActivo(seccion);

      if (info.js) {
        import(info.js)
          .then(mod => {
            if (seccion === "nuevo_ticket" && typeof mod.initNuevoTicket === 'function') mod.initNuevoTicket();
            if (seccion === "mis_tickets" && typeof mod.initMisTickets === 'function') mod.initMisTickets();
            if (seccion === "manual" && typeof mod.initManual === 'function') mod.initManual();
            if (typeof mod.initDetalleTicket === 'function') mod.initDetalleTicket();
          })
          .catch(e => console.error("Error cargando JS de sección:", e));
      }
    } catch (e) {
      dynamicContent.innerHTML = `<p style='padding:2rem;'>No se pudo cargar la sección.</p>`;
    } finally {
      ocultarLoader();
    }
  }

  // Hacer la función global para que funcione desde onclick
  window.cargarSeccion = cargarSeccion;

  function marcarActivo(seccion) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === seccion);
    });
  }

  function inicializarSidebar() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const iconExpand = sidebarToggle.querySelector('.icon-expand');
    const iconClose = sidebarToggle.querySelector('.icon-close');

    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      document.querySelector(".main-content").classList.toggle("sidebar-collapsed");

      if (sidebar.classList.contains("collapsed")) {
        iconExpand.style.display = "inline";
        iconClose.style.display = "none";
      } else {
        iconExpand.style.display = "none";
        iconClose.style.display = "inline";
      }

    });

    if (sidebar.classList.contains("collapsed")) {
      iconExpand.style.display = "inline";
      iconClose.style.display = "none";
    } else {
      iconExpand.style.display = "none";
      iconClose.style.display = "inline";
    }
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
        window.location.href = "/app/index.html";
      }
    });
  }
    // FUNCION: MOSTRAR NOMBRE DEL USUARIO
    async function mostrarNombreUsuario() {
        let nombre = localStorage.getItem('usuarioNombre');
        if (!nombre) {
            try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: perfil, error } = await supabase
                .from('profiles')
                .select('nombre')
                .eq('profile_id', user.id)
                .single();
                if (perfil && perfil.nombre) {
                nombre = perfil.nombre;
                } else {
                nombre = user.email || 'Usuario';
                }
            }
            } catch (e) {
            nombre = 'Usuario';
            }
        }
        const nombreElem = document.getElementById('userName');
        if (nombreElem) nombreElem.textContent = nombre || 'Usuario';
    }

  // Inicializar la aplicación
  inicializarSidebar();
  inicializarLogoutDirecto();
  mostrarNombreUsuario();
  
  // Cargar dashboard inicial
  cargarDashboardInicial();
  
  // Event listeners para navegación
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-section');
      cargarSeccion(seccion);
    });
  });

  // Función para cargar el dashboard inicial
  function cargarDashboardInicial() {
    const dashboardHTML = `
      <div class="content-card" onclick="cargarSeccion('nuevo_ticket')">
        <div class="card-header">
          <div class="card-icon-container">
            <img src="/assets/icons/plus-circle.svg" alt="Nuevo Ticket" class="card-icon" loading="lazy" decoding="async">
          </div>
          <h3 class="card-title">Nuevo Ticket</h3>
        </div>
        <p class="card-description">Creá un nuevo ticket de compra</p>
        <div class="card-content">
          <button class="action-button">
            Crear Ticket
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="content-card" onclick="cargarSeccion('mis_tickets')">
        <div class="card-header">
          <div class="card-icon-container">
            <img src="/assets/icons/list.svg" alt="Mis Tickets" class="card-icon" loading="lazy" decoding="async">
          </div>
          <h3 class="card-title">Mis Tickets</h3>
        </div>
        <p class="card-description">Revisá el estado de tus tickets</p>
        <div class="card-content">
          <button class="action-button">
            Ver Tickets
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="content-card" onclick="cargarSeccion('manual')">
        <div class="card-header">
          <div class="card-icon-container">
            <img src="/assets/icons/book.svg" alt="Manual" class="card-icon" loading="lazy" decoding="async">
          </div>
          <h3 class="card-title">Manual</h3>
        </div>
        <p class="card-description">Consultá la documentación</p>
        <div class="card-content">
          <button class="action-button">
            Ver Manual
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    dynamicContent.innerHTML = dashboardHTML;
    pageTitle.textContent = "Dashboard";
    document.getElementById("pageIcon").innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
      </svg>
    `;
  }
});