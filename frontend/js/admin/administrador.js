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

function cambiarSeccion(section) {
    const templateId = seccionToTemplateId[section];
    const template = document.getElementById(templateId);
    const container = document.getElementById("dynamicContent");

    if (!template) {
        container.innerHTML = `<p style="padding: 1rem;">❌ No se encontró el template para: ${section}</p>`;
        console.error(`No se encontró el template con ID: ${section}Template`);
        return;
    }

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
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuario no autenticado.");
    return;
  }

  const token = localStorage.getItem('supabaseToken');
  if (!token) {
    console.error("Token de sesión no encontrado.");
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
    const [resProcesados, resPromedio, resPendientes] = await Promise.all([
      fetch('/stats/tickets-procesados', { headers }).then(r => r.json()),
      fetch('/stats/promedio-mensual', { headers }).then(r => r.json()),
      fetch('/stats/tickets-pendientes', { headers }).then(r => r.json())
    ]);

    document.getElementById("actividadTickets").textContent = resProcesados.total ?? 0;
    document.getElementById("actividadPromedio").textContent = `$${resPromedio.promedio?.toLocaleString() ?? 0}`;
    document.getElementById("actividadPendientes").textContent = resPendientes.total ?? 0;

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
