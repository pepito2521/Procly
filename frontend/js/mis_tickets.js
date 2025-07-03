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
        <td>${ticket.codigo_ticket || ticket.ticket_id}</td>
        <td>${ticket.nombre}</td>
        <td>
          <span class="estado-badge ${claseEstado}">
            ${ticket.estado}
          </span>
        </td>
        <td>
          <a href="detalle_ticket.html?id=${ticket.ticket_id}" class="ver-icono">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#090B0A" viewBox="0 0 16 16">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
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
