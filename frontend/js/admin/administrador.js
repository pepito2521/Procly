import { supabase } from "/js/supabaseClient.js";
import { mostrarLoader, ocultarLoader } from "/js/components/loader.js";

document.addEventListener("DOMContentLoaded", async () => {
  const secciones = {
    dashboard: {
      nombre: "Dashboard",
      archivo: "dashboard.html",
      js: "/js/admin/dashboard_admin.js",
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40ZM48,56H208a8,8,0,0,1,8,8v80H40V64A8,8,0,0,1,48,56ZM208,184H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z"></path>
        </svg>
      `
    },
    actividad: {
      nombre: "Registro de Actividad",
      archivo: "actividad.html",
      js: "/js/admin/actividad_admin.js",
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
        </svg>
      `
    },
    usuarios: {
      nombre: "Gestionar Usuarios",
      archivo: "usuarios.html",
      js: "/js/admin/usuarios_admin.js",
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
        </svg>
      `
    },
    direcciones: {
      nombre: "Gestionar Direcciones",
      archivo: "direcciones.html",
      js: "/js/admin/direcciones_admin.js",
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
        </svg>
      `
    }
  };

  const dynamicContent = document.getElementById("dynamicContent");
  const pageTitle = document.getElementById("pageTitle");
  const pageIcon = document.getElementById("pageIcon");

  async function cargarSeccion(seccion) {
    const info = secciones[seccion];
    if (!info) return;
    
    try {
      await mostrarLoader();

      const resp = await fetch(`/app/admin/components/${info.archivo}`);
      const html = await resp.text();
      dynamicContent.innerHTML = html;
      pageTitle.textContent = info.nombre;
      pageIcon.innerHTML = info.icon;
      marcarActivo(seccion);

      if (info.js) {
        import(info.js)
          .then(mod => {
            if (seccion === "dashboard" && typeof mod.initDashboard === 'function') mod.initDashboard();
            if (seccion === "actividad" && typeof mod.initActividad === 'function') mod.initActividad();
            if (seccion === "usuarios" && typeof mod.initUsuarios === 'function') mod.initUsuarios();
            if (seccion === "direcciones" && typeof mod.initDirecciones === 'function') mod.initDirecciones();
          })
          .catch(e => console.error("Error cargando JS de sección:", e));
      }
    } catch (e) {
      console.error("Error cargando sección:", e);
      dynamicContent.innerHTML = `<p style='padding:2rem;'>No se pudo cargar la sección.</p>`;
    } finally {
      ocultarLoader();
    }
  }

  function marcarActivo(seccion) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === seccion);
    });
  }

  // FUNCIONALIDADES DEL SIDEBAR
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

  // FUNCION: VERIFICAR ROL DEL USUARIO
  async function verificarRolUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: perfil, error } = await supabase
        .from('profiles')
        .select('rol_usuario')
        .eq('profile_id', user.id)
        .single();

      if (error) {
        console.error("Error obteniendo rol:", error);
        return false;
      }

      return perfil && perfil.rol_usuario === 'admin';
    } catch (e) {
      console.error("Error verificando rol:", e);
      return false;
    }
  }

  // FUNCION: MOSTRAR NOMBRE DEL ADMINISTRADOR
  async function mostrarNombreAdmin() {
    let nombre = localStorage.getItem('adminNombre');
    if (!nombre) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Usuario autenticado:", user);
        if (user) {
          const { data: perfil, error } = await supabase
            .from('profiles')
            .select('nombre')
            .eq('profile_id', user.id)
            .single();
          console.log("Perfil encontrado:", perfil, "Error:", error);
          if (perfil && perfil.nombre) {
            nombre = perfil.nombre;
          } else {
            nombre = user.email || 'Administrador';
          }
        }
      } catch (e) {
        nombre = 'Administrador';
      }
    }
    document.getElementById('adminName').textContent = nombre || 'Administrador';
  }

  // FUNCION: INICIALIZAR TOGGLE DE ROL
  async function inicializarRoleToggle() {
    const roleToggle = document.getElementById('roleToggle');
    const roleToggleInput = document.getElementById('roleToggleInput');
    
    if (!roleToggle || !roleToggleInput) return;

    // Verificar si el usuario es admin
    const esAdmin = await verificarRolUsuario();
    
    if (esAdmin) {
      roleToggle.style.display = 'flex';
      
      // Event listener para el toggle
      roleToggleInput.addEventListener('change', async (e) => {
        if (e.target.checked) {
          // Cambiar a modo usuario
          console.log('Cambiando a modo usuario...');
          window.location.href = '/app/user/usuario.html';
        } else {
          // Mantener en modo admin
          console.log('Manteniendo modo admin');
        }
      });
      
      // Verificar si viene del modo usuario
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('from') === 'user') {
        roleToggleInput.checked = true;
      }
    } else {
      // Si no es admin, redirigir a usuario.html
      console.log('Usuario no es admin, redirigiendo a usuario.html');
      window.location.href = '/app/user/usuario.html';
    }
  }

  // FUNCION: LOGOUT
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
  mostrarNombreAdmin();
  inicializarRoleToggle();
});