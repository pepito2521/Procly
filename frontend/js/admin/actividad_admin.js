// ACTIVIDAD ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initActividad() {
  console.log("Inicializando Actividad Admin...");
  cargarActividadTemplate();
}

async function cargarActividadTemplate() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // Función helper para manejar fetch con mejor manejo de errores
    async function fetchWithErrorHandling(url, headers) {
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          console.warn(`Error HTTP ${response.status} para ${url}`);
          return null;
        }
        const text = await response.text();
        if (!text) {
          console.warn(`Respuesta vacía para ${url}`);
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.warn(`Error parseando JSON para ${url}:`, text);
          return null;
        }
      } catch (fetchError) {
        console.warn(`Error en fetch para ${url}:`, fetchError);
        return null;
      }
    }

    // Cargar KPIs y datos de actividad
    const [
      ticketsTotales,
      ticketsEntregados,
      ticketsEnProceso,
      ticketsCancelados,
      historialTickets
    ] = await Promise.all([
      fetchWithErrorHandling('/stats/tickets-totales', headers),
      fetchWithErrorHandling('/stats/tickets-entregados', headers),
      fetchWithErrorHandling('/stats/tickets-en-proceso', headers),
      fetchWithErrorHandling('/stats/tickets-cancelados', headers),
      fetchWithErrorHandling('/stats/historial-tickets', headers)
    ]);

    // Actualizar KPIs
    document.getElementById("actividadTotales").textContent = ticketsTotales?.total ?? 0;
    document.getElementById("actividadTotalesSub").textContent = "Total de tickets procesados";
    
    document.getElementById("actividadEntregados").textContent = ticketsEntregados?.total ?? 0;
    document.getElementById("actividadEntregadosSub").textContent = "Tickets entregados exitosamente";
    
    document.getElementById("actividadEnProceso").textContent = ticketsEnProceso?.total ?? 0;
    document.getElementById("actividadEnProcesoSub").textContent = "Tickets en proceso actualmente";
    
    document.getElementById("actividadCancelados").textContent = ticketsCancelados?.total ?? 0;
    document.getElementById("actividadCanceladosSub").textContent = "Tickets cancelados";

    // Cargar tabla de historial
    cargarTablaHistorial(historialTickets?.tickets || []);

  } catch (error) {
    console.error("Error al cargar actividad:", error);
  }
}

function cargarTablaHistorial(tickets) {
  const tbody = document.getElementById("tablaActividad");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!tickets || tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">⚠️ No hay tickets en el historial</td></tr>`;
    return;
  }

  tickets.forEach(ticket => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ticket.codigo_ticket || 'N/A'}</td>
      <td>${ticket.nombre_ticket || 'Sin nombre'}</td>
      <td>${ticket.nombre} ${ticket.apellido}</td>
      <td>
        <span class="estado-badge ${ticket.estado?.toLowerCase() || 'default'}">
          ${ticket.estado || 'Desconocido'}
        </span>
      </td>
      <td>${ticket.precio || 'En proceso'}</td>
    `;
    tbody.appendChild(row);
  });

  // Configurar buscador
  const inputBuscador = document.getElementById("buscadorTickets");
  if (inputBuscador) {
    inputBuscador.addEventListener("input", (e) => {
      const valor = e.target.value.toLowerCase();
      const filas = tbody.querySelectorAll("tr");
      filas.forEach((fila) => {
        const textoCodigo = fila.children[0]?.textContent.toLowerCase() ?? "";
        const textoNombre = fila.children[1]?.textContent.toLowerCase() ?? "";
        const textoUsuario = fila.children[2]?.textContent.toLowerCase() ?? "";
        
        const coincide = textoCodigo.includes(valor) || 
                        textoNombre.includes(valor) || 
                        textoUsuario.includes(valor);
        
        fila.style.display = coincide ? "" : "none";
      });
    });
  }
}

