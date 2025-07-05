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
    document.getElementById("ticket-id").textContent = data.codigo_ticket;
    document.getElementById("ticket-nombre").textContent = data.nombre;
    document.getElementById("ticket-descripcion").textContent = data.descripcion;
    const estadoSpan = document.createElement("span");
    estadoSpan.classList.add("estado-badge", data.estado.toLowerCase().replace(/\s+/g, "-"));
    estadoSpan.textContent = data.estado;
    const estadoContainer = document.getElementById("ticket-estado");
    estadoContainer.innerHTML = "";
    estadoContainer.appendChild(estadoSpan);
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

// ENVÍA LA PROPUESTA SELECCIONADA AL BACKEND
async function enviarSeleccionPropuesta(ticket_id) {
  if (!propuestaSeleccionada) {
    alert("Primero seleccioná una propuesta.");
    return;
  }

  const token = localStorage.getItem("supabaseToken");
  if (!token) {
    alert("No estás autenticado.");
    return;
  }

  try {
    const res = await fetch(`https://procly.onrender.com/tickets/${ticket_id}/seleccionar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        propuesta_seleccionada: propuestaSeleccionada
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al seleccionar propuesta.");
    }

    alert("¡Propuesta seleccionada correctamente!");
    location.reload();

  } catch (error) {
    console.error("Error al enviar propuesta seleccionada:", error);
    alert("Ocurrió un error al guardar tu selección.");
  }
}

//  FUNCION: DESCARGAR PROPUESTA

function descargarPropuesta(url) {
  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get("id");

  if (!url || !ticketId) {
    alert("No se puede descargar la propuesta.");
    return;
  }

  const propuesta = url.includes("propuesta_a") ? "A" :
                    url.includes("propuesta_b") ? "B" :
                    url.includes("propuesta_c") ? "C" : "X";

  const nombreArchivo = `PROPUESTA ${propuesta} - ${ticketId}.pdf`;

  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//  FUNCION: ABRIR PROPUESTA
function abrirPropuesta(url) {
  if (!url) {
    alert("No hay propuesta disponible.");
    return;
  }
  window.open(url, '_blank');
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

      if (estado === "Propuestas") {
        const urls = [data.propuesta_a, data.propuesta_b, data.propuesta_c];

        // DESCARGAR PROPUESTA
        clone.querySelectorAll(".icono-descarga").forEach((el, index) => {
          el.addEventListener("click", () => {
            descargarPropuesta(urls[index]);
          });
        });

        // VER PROPUESTA
        clone.querySelectorAll(".icono-ver").forEach((el, index) => {
          el.addEventListener("click", () => {
            abrirPropuesta(urls[index]);
          });
        });

        // SELECCIONAR PROPUESTA
        const btn = clone.getElementById("btn-seleccionar-propuesta");
        if (btn) {
          btn.addEventListener("click", () => {
            enviarSeleccionPropuesta(data.ticket_id);
          });
        }
      }

      panel.appendChild(clone);
    }
  }
}

// SELECTOR DE PROPUESTA
let propuestaSeleccionada = null;

document.addEventListener("click", (e) => {
  const card = e.target.closest(".card-propuesta");
  if (!card) return;

  const propuesta = card.getAttribute("data-propuesta");

  if (propuestaSeleccionada === propuesta) {
    card.classList.remove("selected");
    propuestaSeleccionada = null;

    const btn = document.getElementById("btn-seleccionar-propuesta");
    if (btn) btn.disabled = true;
    return;
  }

  document.querySelectorAll(".card-propuesta").forEach(el => el.classList.remove("selected"));
  card.classList.add("selected");
  propuestaSeleccionada = propuesta;

  const btn = document.getElementById("btn-seleccionar-propuesta");
  if (btn) btn.disabled = false;
});