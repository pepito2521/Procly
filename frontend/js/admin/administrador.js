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
}
  

// TEMPLATE: DASHBOARD
async function cargarDatosKPIs() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) {
    console.error("Usuario no autenticado.");
    return;
  }

  const userId = user.id;

  try {
    const [tickets, mensual, promedio, acumulado] = await Promise.all([
      fetch(`/stats/tickets-procesados?user_id=${userId}`).then(r => r.json()),
      fetch(`/stats/gasto-mensual?user_id=${userId}`).then(r => r.json()),
      fetch(`/stats/promedio-mensual?user_id=${userId}`).then(r => r.json()),
      fetch(`/stats/acumulado-anual?user_id=${userId}`).then(r => r.json())
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
        <td>${d.is_active ? "🟢 Activa" : "🔴 Inactiva"}</td>
        <td><button class="btn btn-sm">Editar</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error cargando direcciones:", error);
    document.getElementById("tablaDirecciones").innerHTML = `<tr><td colspan="6">❌ Error al cargar direcciones</td></tr>`;
  }
}




// TEMPLATE: USUARIOS

// TEMPLATE: ACTIVIDAD