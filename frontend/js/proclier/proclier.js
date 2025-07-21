// PROCLIER PANEL - CARGA DINÁMICA DE COMPONENTES

document.addEventListener("DOMContentLoaded", async () => {
  // Definir secciones disponibles
  const secciones = {
    dashboard: {
      nombre: "Dashboard",
      archivo: "dashboard_proclier.html",
      js: "/js/proclier/dashboard_proclier.js",
      icon: "<svg width='24' height='24' fill='currentColor'><circle cx='12' cy='12' r='10' /></svg>"
    },
    tickets: {
      nombre: "Gestionar Tickets",
      archivo: "gestion_tickets.html",
      js: "/js/proclier/gestion_tickets.js",
      icon: "<svg width='24' height='24' fill='currentColor'><rect x='4' y='4' width='16' height='16' rx='4'/></svg>"
    },
    usuarios: {
      nombre: "Administrar Usuarios",
      archivo: "gestion_usuarios.html",
      js: "/js/proclier/gestion_usuarios.js",
      icon: "<svg width='24' height='24' fill='currentColor'><path d='M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z'/></svg>"
    },
    empresas: {
      nombre: "Empresas",
      archivo: "empresas.html",
      js: null,
      icon: "<svg width='24' height='24' fill='currentColor'><rect x='2' y='7' width='20' height='13' rx='2'/></svg>"
    },
    manual: {
      nombre: "Manual de Usuario",
      archivo: "manual.html",
      js: null,
      icon: "<svg width='24' height='24' fill='currentColor'><path d='M4 4h16v16H4z'/></svg>"
    }
  };

  const dynamicContent = document.getElementById("dynamicContent");
  const pageTitle = document.getElementById("pageTitle");
  const pageIcon = document.getElementById("pageIcon");

  async function cargarSeccion(seccion) {
    const info = secciones[seccion];
    if (!info) return;
    try {
      // Loader opcional
      const loader = document.getElementById("loader-placeholder");
      if (loader) loader.style.display = "block";

      const resp = await fetch(`/app/proclier/components/${info.archivo}`);
      const html = await resp.text();
      dynamicContent.innerHTML = html;
      pageTitle.textContent = info.nombre;
      pageIcon.innerHTML = info.icon;
      marcarActivo(seccion);

      if (info.js) {
        import(info.js).catch(e => console.error("Error cargando JS de sección:", e));
      }
    } catch (e) {
      console.error("Error cargando sección:", e);
      dynamicContent.innerHTML = `<p style='padding:2rem;'>No se pudo cargar la sección.</p>`;
    } finally {
      const loader = document.getElementById("loader-placeholder");
      if (loader) loader.style.display = "none";
    }
  }

  function marcarActivo(seccion) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === seccion);
    });
  }

  // Sidebar toggle (igual que en admin/usuarios)
  function inicializarSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".main-content");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const iconExpand = sidebarToggle.querySelector('.icon-expand');
    const iconClose = sidebarToggle.querySelector('.icon-close');

    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("sidebar-collapsed");
      if (sidebar.classList.contains("collapsed")) {
        iconExpand.style.display = "inline";
        iconClose.style.display = "none";
      } else {
        iconExpand.style.display = "none";
        iconClose.style.display = "inline";
      }
    });

    // Estado inicial
    if (sidebar.classList.contains("collapsed")) {
      iconExpand.style.display = "inline";
      iconClose.style.display = "none";
    } else {
      iconExpand.style.display = "none";
      iconClose.style.display = "inline";
    }
  }

  // Mostrar nombre del usuario proclier (opcional)
  async function mostrarNombreProclier() {
    let nombre = localStorage.getItem('proclierNombre');
    if (!nombre) {
      nombre = 'Proclier';
    }
    document.getElementById('proclierName').textContent = nombre || 'Proclier';
  }

  // Logout directo
  function inicializarLogoutDirecto() {
    const logoutIcon = document.getElementById("logout-direct");
    if (!logoutIcon) return;
    logoutIcon.addEventListener("click", async () => {
      localStorage.removeItem('supabaseToken');
      window.location.href = "/app/index.html";
    });
  }

  // Event listeners para navegación
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-section');
      cargarSeccion(seccion);
    });
  });

  // Inicialización
  cargarSeccion('dashboard');
  inicializarSidebar();
  inicializarLogoutDirecto();
  mostrarNombreProclier();
});