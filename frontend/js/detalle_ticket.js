import { cargarNavbar } from './navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await cargarNavbar();

  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get("id");

  if (!ticketId) {
    document.getElementById("ticket-info").innerHTML = "<p>ID de ticket no encontrado en la URL</p>";
    return;
  }

  const token = localStorage.getItem("supabaseToken");
  if (!token) {
    document.getElementById("ticket-info").innerHTML = "<p>Usuario no autenticado</p>";
    return;
  }

  try {
    const res = await fetch(`https://procly.onrender.com/tickets/${ticketId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "No se pudo obtener el ticket.");
    }

    // Mostrar datos en pantalla
    document.getElementById("ticket-id").textContent = data.ticket_id;
    document.getElementById("ticket-nombre").textContent = data.descripcion;
    document.getElementById("ticket-estado").textContent = data.estado;
    document.getElementById("ticket-presupuesto").textContent = data.presupuesto ?? "Sin límite";
    document.getElementById("ticket-fecha").textContent = data.fecha_entrega ?? "No asignada";

    actualizarProgreso(data.estado);

  } catch (error) {
    console.error("Error al cargar ticket:", error);
    document.getElementById("ticket-info").innerHTML = `<p>Error al obtener el ticket: ${error.message}</p>`;
  }
});

// Avanza los pasos según estado
function actualizarProgreso(estado) {
  const pasos = {
    "Creado": "step-creado",
    "En proceso": "step-proceso",
    "Propuestas": "step-propuestas",
    "En camino": "step-camino",
    "Entregado": "step-entregado"
  };

  let activar = true;
  for (const key in pasos) {
    const el = document.getElementById(pasos[key]);
    if (activar) el.classList.add("activo");
    if (key === estado) activar = false;
  }
}
