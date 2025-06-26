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

    // Mostrar datos básicos en pantalla (opcional, según tu HTML actual)
    document.getElementById("ticket-id").textContent = data.ticket_id;
    document.getElementById("ticket-nombre").textContent = data.descripcion;
    document.getElementById("ticket-estado").textContent = data.estado;
    document.getElementById("ticket-presupuesto").textContent = data.presupuesto ?? "Sin límite";
    document.getElementById("ticket-fecha").textContent = data.fecha_entrega ?? "No asignada";

    actualizarProgreso(data.estado);
    mostrarPanelPorEstado(data.estado, data);

  } catch (error) {
    console.error("Error al cargar ticket:", error);
    document.getElementById("ticket-info").innerHTML = `<p>Error al obtener el ticket: ${error.message}</p>`;
  }
});

// Marcar los pasos completados en el progress
function actualizarProgreso(estado) {
  const pasos = {
    "Creado": "paso-creado",
    "En proceso": "paso-proceso",
    "Propuestas": "paso-propuestas",
    "En camino": "paso-camino",
    "Entregado": "paso-entregado"
  };

  let activar = true;
  for (const key in pasos) {
    const el = document.getElementById(pasos[key]);
    if (el) {
      if (activar) el.classList.add("paso-activo");
      if (key === estado) activar = false;
    }
  }
}

// Mostrar el panel dinámico según estado
function mostrarPanelPorEstado(estado, data) {
  const panel = document.getElementById("panel-estado-dinamico");
  panel.innerHTML = ""; // Limpiar antes

  if (estado === "Creado") {
    panel.innerHTML = `<h3>Estamos revisando tu pedido</h3><p>En breve te contactaremos.</p>`;
  } else if (estado === "En proceso") {
    panel.innerHTML = `<h3>Buscando proveedores...</h3><p>Estamos trabajando en conseguir opciones.</p>`;
  } else if (estado === "Propuestas") {
    panel.innerHTML = `
      <h3>Tienes nuevas propuestas</h3>
      <p>Consulta las opciones enviadas por nuestros proveedores.</p>
      <a href="/propuestas.html?ticketId=${data.ticket_id}" class="btn2">Ver Propuestas</a>
    `;
  } else if (estado === "En camino") {
    panel.innerHTML = `<h3>Tu pedido está en camino 🚚</h3><p>Te llegará antes del ${data.fecha_entrega ?? "próximos días"}.</p>`;
  } else if (estado === "Entregado") {
    panel.innerHTML = `<h3>Pedido entregado ✅</h3><p>Gracias por confiar en PROCLY. Tu ticket está finalizado.</p>`;
  }
}
