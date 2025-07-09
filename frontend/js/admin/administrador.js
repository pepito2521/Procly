import { supabase } from "/js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  inicializarSidebar();
  inicializarLogoutDirecto();
  cambiarSeccion("dashboard");
});


// FUNCIONALIDADES DEL SIDEBAR
function inicializarSidebar() {
    
    document.getElementById("sidebarToggle")?.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });
  
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const section = e.currentTarget.getAttribute("data-section");
  
        document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
        e.currentTarget.classList.add("active");
        cambiarSeccion(section);
      });
    });
}

// FUNCION: LOGOUT

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
  

// TEMPLATES

const seccionToTemplateId = {
    dashboard: "dashboardTemplate",
    actividad: "actividadTemplate",
    usuarios: "usuariosTemplate",
    direcciones: "direccionesTemplate"
};

const seccionToTitulo = {
  dashboard: "Dashboard",
  actividad: "Registro de Actividad",
  usuarios: "Gestionar Usuarios",
  direcciones: "Gestionar Direcciones"
};

const seccionToIcon = {
  dashboard: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#374151" viewBox="0 0 24 24">
        <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40ZM48,56H208a8,8,0,0,1,8,8v80H40V64A8,8,0,0,1,48,56ZM208,184H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z"></path>
    </svg>
  `,
  usuarios: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#374151" viewBox="0 0 24 24">
        <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
    </svg>
  `,
  direcciones: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#374151" viewBox="0 0 24 24">
      <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
    </svg>
  `,
  actividad: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#374151" viewBox="0 0 24 24">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
    </svg>
  `
};


function cambiarSeccion(section) {
    const templateId = seccionToTemplateId[section];
    const template = document.getElementById(templateId);
    const container = document.getElementById("dynamicContent");

    if (!template) {
        container.innerHTML = `<p style="padding: 1rem;">❌ No se encontró el template para: ${section}</p>`;
        console.error(`No se encontró el template con ID: ${section}Template`);
        return;
    }

    const titulo = seccionToTitulo[section] ?? "Panel";
    document.getElementById("pageTitle").textContent = titulo;

    const iconHTML = seccionToIcon[section] ?? '';
    document.getElementById("pageIcon").innerHTML = iconHTML;


    container.innerHTML = "";
    container.appendChild(template.content.cloneNode(true));

    if (section === "dashboard") {
        cargarDatosKPIs();
    }

    if (section === "direcciones") {
      cargarDireccionesTemplate();
    }    

    if (section === "usuarios") {
      cargarUsuariosTemplate();
    }

    if (section === "actividad") {
      cargarActividadTemplate();
    }
    
    
}
  
// TEMPLATE: DASHBOARD
async function cargarDatosKPIs() {
  const token = localStorage.getItem('supabaseToken');
  if (!token) {
    console.error("Usuario no autenticado (token faltante).");
    return;
  }

  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [tickets, mensual, promedio, acumulado] = await Promise.all([
      fetch(`/stats/tickets-procesados`, { headers }).then(r => r.json()),
      fetch(`/stats/gasto-mensual`, { headers }).then(r => r.json()),
      fetch(`/stats/promedio-mensual`, { headers }).then(r => r.json()),
      fetch(`/stats/acumulado-anual`, { headers }).then(r => r.json())
    ]);

    document.getElementById("kpi-gasto-mensual").textContent = `$${mensual.total?.toLocaleString() ?? 0}`;
    document.getElementById("kpi-promedio-mensual").textContent = `$${promedio.promedio?.toLocaleString() ?? 0}`;
    document.getElementById("kpi-acumulado").textContent = `$${acumulado.total?.toLocaleString() ?? 0}`;
    document.getElementById("kpi-tickets-procesados").textContent = tickets.total ?? 0;

    const mesActual = new Date().getMonth();
    const nombreMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mesActual];
    document.getElementById("mesNombre").textContent = nombreMes;
    document.getElementById("mesNumero").textContent = `Mes ${mesActual + 1} de 12`;

  } catch (error) {
    console.error("Error cargando KPIs:", error);
  }
}




// TEMPLATE: DIRECCIONES
async function cargarDireccionesTemplate() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Usuario no autenticado (token faltante).");
      return;
    }
    
    const headers = { 'Authorization': `Bearer ${token}` };

    const [kpi, lista] = await Promise.all([
      fetch(`/stats/direcciones-totales`, { headers }).then(r => r.json()),
      fetch(`/stats/direcciones`, { headers }).then(r => r.json())
    ]);    
    
    document.getElementById("totalDirecciones").textContent = kpi.total ?? 0;

    const tbody = document.getElementById("tablaDirecciones");
    tbody.innerHTML = "";

    if (lista.direcciones.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">⚠️ No hay direcciones disponibles</td></tr>`;
      return;
    }

    lista.direcciones.forEach(d => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.nombre}</td>
        <td>${d.direccion}</td>
        <td>${d.ciudad ?? ""}, ${d.provincia ?? ""}</td>
        <td>${d.codigo_postal ?? "-"}</td>
        <td>
          <span class="badge ${d.is_active ? 'badge-success' : 'badge-danger'}">
            ${d.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 256 256">
              <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z"></path>
            </svg>
            Editar
          </button>
        </td>

      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error cargando direcciones:", error);
    document.getElementById("tablaDirecciones").innerHTML = `<tr><td colspan="6">❌ Error al cargar direcciones</td></tr>`;
  }
}

// TEMPLATE: USUARIOS
async function cargarUsuariosTemplate() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // 1. KPIs
    const [kpiTotal, kpiActivos, kpiGasto, listado] = await Promise.all([
      fetch('/stats/usuarios-totales', { headers }).then(r => r.json()),
      fetch('/stats/usuarios-activos', { headers }).then(r => r.json()),
      fetch('/stats/gasto-promedio-mensual', { headers }).then(r => r.json()),
      fetch('/stats/usuarios', { headers }).then(r => r.json())
    ]);

    document.getElementById("totalUsuarios").textContent = kpiTotal.total ?? 0;
    document.getElementById("usuariosActivos").textContent = kpiActivos.total ?? 0;
    document.getElementById("gastoPromedio").textContent = `$${kpiGasto.promedio?.toLocaleString() ?? 0}`;

    // 2. Tabla
    const tbody = document.getElementById("tablaUsuarios");
    tbody.innerHTML = "";

    if (!listado.usuarios || listado.usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">⚠️ No hay usuarios disponibles</td></tr>`;
      return;
    }

    listado.usuarios.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.nombre} ${u.apellido}</td>
        <td>${u.email}</td>
        <td>$${u.limite_gasto_mensual?.toLocaleString() ?? '-'}</td>
        <td>
          <span class="badge ${u.is_active ? 'badge-success' : 'badge-danger'}">
            ${u.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 256 256">
              <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z"></path>
            </svg>
            Editar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    document.getElementById("tablaUsuarios").innerHTML = `<tr><td colspan="6">❌ Error al cargar usuarios</td></tr>`;
  }
}


// TEMPLATE: ACTIVIDAD
async function cargarActividadTemplate() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // 1. Cargar KPIs
    const [resEntregados, resEnProceso, resCancelados] = await Promise.all([
      fetch('/stats/tickets-entregados', { headers }).then(r => r.json()),
      fetch('/stats/tickets-en-proceso', { headers }).then(r => r.json()),
      fetch('/stats/tickets-cancelados', { headers }).then(r => r.json())
    ]);
    
    document.getElementById("actividadEntregados").textContent = resEntregados.total ?? 0;
    document.getElementById("actividadEnProceso").textContent = resEnProceso.total ?? 0;
    document.getElementById("actividadCancelados").textContent = resCancelados.total ?? 0;    

    // 2. Cargar Tabla
    const response = await fetch('/stats/actividad-tickets', { headers });
    const { tickets } = await response.json();

    const tbody = document.getElementById("tablaActividad");
    tbody.innerHTML = "";

    if (!tickets || tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">⚠️ No hay tickets registrados</td></tr>`;
      return;
    }

    tickets.forEach(t => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.codigo_ticket}</td>
        <td>${t.nombre} ${t.apellido}</td>
        <td>
          <span class="badge ${getEstadoColor(t.estado)}">${t.estado}</span>
        </td>
        <td>${t.categoria}</td>
        <td>${t.estado === 'entregado' ? `$${t.precio.toLocaleString()}` : 'En proceso'}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    console.error("Error al cargar actividad:", error);
    document.getElementById("tablaActividad").innerHTML = `<tr><td colspan="5">❌ Error al cargar actividad</td></tr>`;
  }
}

// Utilidad: color según estado
function getEstadoColor(estado) {
  switch (estado) {
    case 'pendiente':
      return 'badge-warning';
    case 'en revisión':
      return 'badge-secondary';
    case 'entregado':
      return 'badge-success';
    default:
      return 'badge-default';
  }
}
