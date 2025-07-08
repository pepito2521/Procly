import { supabase } from "/js/supabaseClient.js";

export async function inicializar() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    document.getElementById("kpi-gasto-mensual").textContent = `$${mensual.total?.toLocaleString() ?? 0}`;
    document.getElementById("kpi-promedio-mensual").textContent = `$${promedio.promedio?.toLocaleString() ?? 0}`;
    document.getElementById("kpi-acumulado").textContent = `$${acumulado.total?.toLocaleString() ?? 0}`;
    document.getElementById("kpi-tickets-procesados").textContent = tickets.total ?? 0;
    

    // Mostrar mes actual en dashboard
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentMonthName = monthNames[currentMonthIndex];
    const currentMonthNumber = currentMonthIndex + 1;
    
    const mesNombreEl = document.getElementById("mesNombre");
    const mesNumeroEl = document.getElementById("mesNumero");
    
    if (mesNombreEl && mesNumeroEl) {
        mesNombreEl.textContent = currentMonthName;
        mesNumeroEl.textContent = `Mes ${currentMonthNumber} de 12`;
    }
    

  } catch (error) {
    console.error("Error cargando KPIs:", error);
  }
}