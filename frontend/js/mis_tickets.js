import { cargarLoader } from './components/loader.js';
import { cargarNavbar } from './components/navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await cargarLoader();
  await cargarNavbar();
  cargarTickets();

  document.body.classList.remove("oculto");
});

async function cargarTickets() {
  const token = localStorage.getItem('supabaseToken');
  if (!token) {
    console.error("Token no encontrado. El usuario no está autenticado.");
    return;
  }

  try {
    const res = await fetch('https://procly.onrender.com/tickets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const tickets = await res.json();

    if (!Array.isArray(tickets)) {
      console.error('Respuesta inesperada:', tickets);
      return;
    }

    const tbody = document.getElementById("tabla-tickets-body");

    tbody.innerHTML = "";

    if (tickets.length === 0) {
      const filaVacia = document.createElement("tr");
      filaVacia.innerHTML = `
        <td colspan="4" style="text-align:center; padding: 1rem; color: #999;">
          Todavía no creaste ningún ticket.
        </td>
      `;
      tbody.appendChild(filaVacia);
      return;
    }


    const estadoClase = {
      "Creado": "creado",
      "En proceso": "en-progreso",
      "En camino": "en-camino",
      "Entregado": "entregado",
      "Revisar": "revisar",
      "Cancelado": "cancelado"
    };


    tickets.forEach(ticket => {
      const claseEstado = estadoClase[ticket.estado] || "creado"; 
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td><div class="truncar-texto" title="${ticket.codigo_ticket || ticket.ticket_id}">${ticket.codigo_ticket || ticket.ticket_id}</div></td>
        <td>${ticket.nombre}</td>
        <td>
          <span class="estado-badge ${claseEstado}">
            ${ticket.estado}
          </span>
        </td>
        <td>
        <a href="detalle_ticket.html?id=${ticket.ticket_id}" class="ver-icono">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#090B0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error('Error al cargar tickets:', err);
  }
}
