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

    // MOSTRAR DATOS BASICOS DEL TICKET
    document.getElementById("ticket-id").textContent = data.ticket_id;
    document.getElementById("ticket-nombre").textContent = data.nombre;
    document.getElementById("ticket-descripcion").textContent = data.descripcion;
    document.getElementById("ticket-estado").textContent = data.estado;
    document.getElementById("ticket-presupuesto").textContent = data.presupuesto ?? "Sin límite";
    document.getElementById("ticket-fecha").textContent = data.fecha_entrega ?? "No asignada";

    actualizarProgreso(data.estado);
    mostrarPanelPorEstado(data.estado, data);

  } catch (error) {
    console.error("Error al cargar ticket:", error);
  }
});


// PASOS COMPLETADOS EN PROGRESS BAR
function actualizarProgreso(estado) {
  const mapaEstados = {
    "creado": "step-creado",
    "en proceso": "step-proceso",
    "propuestas": "step-propuestas",
    "en camino": "step-camino",
    "entregado": "step-entregado"
  };

  const estadoNormalizado = estado.trim().toLowerCase();

  let activar = true;
  for (const estadoKey in mapaEstados) {
    const idPaso = mapaEstados[estadoKey];
    const el = document.getElementById(idPaso);
    if (el) {
      if (activar) el.classList.add("paso-activo");
      if (estadoKey === estadoNormalizado) activar = false;
    }
  }
}

// PANEL DINAMICO: MENSAJES SEGUN ESTADO DEL TICKET
function mostrarPanelPorEstado(estado, data) {
  const panel = document.getElementById("panel-estado-dinamico");
  panel.innerHTML = ""; 

  if (estado === "Creado") {
    panel.innerHTML = `<p>Estamos revisando tu pedido, en breve te contactaremos.</p>`;
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
    panel.innerHTML = `<p>Tu pedido fue entregado en la direccion de entrega indicada, Gracias por confiar en Procly</p>`;
  }
}
