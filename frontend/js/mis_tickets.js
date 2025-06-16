import { cargarNavbar } from './navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await cargarNavbar();
  cargarTickets();
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
        <td>${ticket.ticket_id}</td>
        <td>${ticket.descripcion}</td>
        <td>
          <span class="estado-badge ${claseEstado}">
            ${ticket.estado}
          </span>
        </td>
        <td>
          <a href="detalle_ticket.html?id=${ticket.ticket_id}" class="ver-icono">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#090B0A" class="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
              <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
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
