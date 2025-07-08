import { supabase } from "../supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = supabase.auth.user();
  if (!user) return;

  const userId = user.id;

  try {
    const [tickets, mensual, promedio, acumulado] = await Promise.all([
      fetch(`/stats/tickets-procesados?user_id=${userId}`).then(r => r.json()),
      fetch(`/stats/gasto-mensual?user_id=${userId}`).then(r => r.json()),
      fetch(`/stats/promedio-mensual?user_id=${userId}`).then(r => r.json()),
      fetch(`/stats/acumulado-anual?user_id=${userId}`).then(r => r.json())
    ]);

    // Cargar en el DOM
    document.getElementById("ticketsProcesados").textContent = tickets.total ?? 0;
    document.getElementById("gastoMensual").textContent = `$${mensual.total?.toLocaleString() ?? 0}`;
    document.getElementById("promedioMensual").textContent = `$${promedio.promedio?.toLocaleString() ?? 0}`;
    document.getElementById("gastoAcumulado").textContent = `$${acumulado.total?.toLocaleString() ?? 0}`;

  } catch (error) {
    console.error("Error cargando KPIs:", error);
  }
});
