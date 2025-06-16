import { cargarNavbar } from './navbar.js';

document.addEventListener("DOMContentLoaded", () => {
  cargarNavbar();

  // OBTENER ID DEL TICKET DESDE LA URL
  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get("id");

  // MOSTRAR TICKET ID
  document.getElementById("ticket-id").textContent = ticketId;

  // DATOS FAKE (para simular)
  const datosFake = {
    TK001: { nombre: "Pedro Marcenaro", estado: "Abierto" },
    TK002: { nombre: "María López", estado: "En progreso" },
    TK003: { nombre: "Juan Pérez", estado: "Cerrado" },
  };

  const data = datosFake[ticketId];
  if (data) {
    document.getElementById("ticket-nombre").textContent = data.nombre;
    document.getElementById("ticket-estado").textContent = data.estado;
  } else {
    document.getElementById("ticket-info").innerHTML =
      "<p>No se encontró información para este ticket.</p>";
  }
});