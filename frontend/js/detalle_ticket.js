document.addEventListener("DOMContentLoaded", () => {
  // INSERTAR NAVBAR EN LA PAGINA
  fetch("../components/navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar-placeholder").innerHTML = data;

    const script = document.createElement("script");
    script.src = "../js/navbar.js";
    script.onload = () => {
      inicializarDropdownNavbar();
    };
    document.body.appendChild(script);

      // RESALTAR NAVBAR-LINK ACTIVO (DENTRO del .then)
      const currentPage = window.location.pathname.split("/").pop();
      const links = document.querySelectorAll(".navbar-links a");

      links.forEach(link => {
        const href = link.getAttribute("href");
        if (
          href.includes(currentPage) ||
          (currentPage === "detalle_ticket.html" && href.includes("mis_tickets.html"))
        ) {
          link.classList.add("active");
        }
      });
  });
  
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