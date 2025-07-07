import { cargarLoader } from './loader.js';
import { cargarNavbarProclier } from './navbar.js';

await cargarLoader();

document.addEventListener('DOMContentLoaded', async () => {
    cargarNavbarProclier();
    const tabla = document.querySelector('#tabla-tickets-proclier tbody');
  
    try {
      const response = await fetch('https://procly.onrender.com/proclier/tickets');
      const tickets = await response.json();
  
      tickets.forEach((ticket) => {
        const fila = document.createElement('tr');
  
        fila.innerHTML = `
          <td>${ticket.ticket_id}</td>
          <td>${ticket.descripcion}</td>
          <td>${ticket.empresa_nombre}</td>
          <td>${ticket.estado}</td>
          <td>
            <button onclick="editarTicket('${ticket.ticket_id}')">Editar</button>
          </td>
        `;
  
        tabla.appendChild(fila);
      });
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    }
  });
  
  function editarTicket(ticketId) {
    window.location.href = `/editar_ticket.html?id=${ticketId}`;
  }
  