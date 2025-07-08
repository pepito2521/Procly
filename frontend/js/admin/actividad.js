import { supabase } from "/js/supabaseClient.js";

export async function inicializar() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const userId = user.id;

    // Obtener empresa_id del perfil
    const { data: perfil, error: errorPerfil } = await supabase
      .from("profiles")
      .select("empresa_id")
      .eq("id", userId)
      .single();

    if (errorPerfil || !perfil) {
      console.error("No se pudo obtener el perfil del usuario", errorPerfil);
      return;
    }

    const empresaId = perfil.empresa_id;

    // Obtener tickets de la empresa
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*, categoria")
      .eq("empresa_id", empresaId);

    if (error) throw error;

    // KPIs
    const total = tickets.length;
    const pendientes = tickets.filter((t) => t.estado === "Creado").length;
    const promedio = tickets.reduce((acc, t) => acc + (t.precio_seleccionado || 0), 0) / (total || 1);

    document.getElementById("actividadTickets").textContent = total;
    document.getElementById("actividadPendientes").textContent = pendientes;
    document.getElementById("actividadPromedio").textContent = `$${Math.round(promedio).toLocaleString()}`;

    // TOP 5 por precio_seleccionado
    const top5 = [...tickets]
      .filter(t => t.precio_seleccionado != null)
      .sort((a, b) => b.precio_seleccionado - a.precio_seleccionado)
      .slice(0, 5);

    const container = document.getElementById("topTicketsList");
    container.innerHTML = "";

    top5.forEach((t, i) => {
      const div = document.createElement("div");
      div.classList.add("ticket-item");
      div.innerHTML = `
        <div>
          <div class="ticket-rank">#${i + 1}</div>
          <div class="ticket-id">${t.codigo_ticket}</div>
          <div class="ticket-title">${t.nombre}</div>
          <div class="ticket-date">${t.fecha_entrega?.split("T")[0] ?? "-"}</div>
        </div>
        <div class="ticket-right">
          <span class="ticket-tag">${t.categoria}</span>
          <div class="ticket-value">$${(t.precio_seleccionado || 0).toLocaleString()}</div>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error cargando actividad:", err);
  }
}