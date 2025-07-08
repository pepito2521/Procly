import { cargarLoader } from "../components/loader.js";
import { supabase } from "/js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  await cargarLoader();
  document.body.classList.remove("oculto");
  await cargarDashboard();
});

async function cargarDashboard() {
  const container = document.getElementById("dynamicContent");

  try {
    const res = await fetch("/admin/partials/dashboard.html");
    const html = await res.text();
    container.innerHTML = html;

    await actualizarKPIs();

  } catch (error) {
    console.error("Error al cargar dashboard:", error);
    container.innerHTML = `<p>Error al cargar el contenido del dashboard.</p>`;
  }
}

async function actualizarKPIs() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

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

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentMonthName = monthNames[currentMonthIndex];
    const currentMonthNumber = currentMonthIndex + 1;

    document.getElementById("mesNombre").textContent = currentMonthName;
    document.getElementById("mesNumero").textContent = `Mes ${currentMonthNumber} de 12`;

  } catch (error) {
    console.error("Error al cargar KPIs:", error);
  }
}
