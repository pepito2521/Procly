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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#090B0A" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793L9.146 4.354a.5.5 0 1 1 .708-.708l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
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
