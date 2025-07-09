import { supabase } from "/js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  inicializarSidebar();
  cargarDashboardTemplate();
  await cargarDatosKPIs();
});

// Maneja colapso de sidebar y navegación
function inicializarSidebar() {
  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const section = e.currentTarget.getAttribute("data-section");
      cambiarSeccion(section);
    });
  });
}

// Carga secciones desde templates
function cambiarSeccion(section) {
  const template = document.getElementById(`${section}Template`);
  const container = document.getElementById("dynamicContent");
  if (template) {
    container.innerHTML = "";
    container.appendChild(template.content.cloneNode(true));

    if (section === "dashboard") {
      cargarDatosKPIs();
    }
  }
}

// Carga datos Supabase
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

// Muestra por defecto
function cargarDashboardTemplate() {
  cambiarSeccion("dashboard");
}