document.addEventListener("DOMContentLoaded", () => {
  // INSERTAR NAVBAR EN LA PAGINA
  fetch("../components/navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar-placeholder").innerHTML = data;

      // RESALTAR NAVBAR-LINK ACTIVO
      const currentPage = window.location.pathname.split("/").pop();
      const links = document.querySelectorAll(".navbar-links a");

      links.forEach(link => {
        if (link.getAttribute("href").includes(currentPage)) {
          link.classList.add("active");
        }
      });

      // AGREGAR FILAS FAKE
      const tbody = document.getElementById("tabla-tickets-body");

      const datosFake = [
        { id: "TK001", nombre: "Termos de agua para evento corporativo", estado: "En progreso" },
        { id: "TK002", nombre: "Stikers logo de la empresa", estado: "Entregado" },
        { id: "TK003", nombre: "Smart TV 50 pulgadas para sala de reuniones", estado: "Cancelado" },
      ];

      datosFake.forEach(ticket => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${ticket.id}</td>
          <td>${ticket.nombre}</td>
          <td>
            <span class="estado-badge ${ticket.estado.toLowerCase().replace(' ', '-')}">
              ${ticket.estado}
            </span>
          </td>
          <td>
            <a href="detalle_ticket.html?id=${ticket.id}" class="ver-icono">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#090B0A" class="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
              </svg>
            </a>
          </td>
        `;
        tbody.appendChild(fila);
      });
    });
});