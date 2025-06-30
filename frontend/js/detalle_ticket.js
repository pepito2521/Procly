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

  const templateId = {
    "Creado": "template-panel-creado",
    "En proceso": "template-panel-proceso",
    "Propuestas": "template-panel-propuestas",
    "En camino": "template-panel-camino",
    "Entregado": "template-panel-entregado",
    "Revisar": "template-panel-revisar",
    "Cancelado": "template-panel-cancelado"
  }[estado];

  if (templateId) {
    const template = document.getElementById(templateId);
    if (template) {
      const clone = template.content.cloneNode(true);

      // Si el estado es "Propuestas", reemplazá placeholders por data real
      if (estado === "Propuestas") {
        clone.querySelectorAll(".icono-descarga").forEach((el, index) => {
          const urls = [data.propuesta_a, data.propuesta_b, data.propuesta_c];
          el.setAttribute("onclick", `descargarPropuesta('${urls[index]}')`);
        });

        const btn = clone.getElementById("btn-seleccionar-propuesta");
        if (btn) btn.setAttribute("onclick", `enviarSeleccionPropuesta('${data.ticket_id}')`);
      }

      panel.appendChild(clone);
    }
  }
}
