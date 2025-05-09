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
          <td> <span class="estado-badge ${ticket.estado.toLowerCase().replace(' ', '-')}">${ticket.estado}</span></td>
          <td><a href="#">Ver</a></td>
        `;
        tbody.appendChild(fila);
      });
    });
});