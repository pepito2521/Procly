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
        { id: "TK001", nombre: "Pedro Marcenaro", estado: "Abierto" },
        { id: "TK002", nombre: "María López", estado: "En progreso" },
        { id: "TK003", nombre: "Juan Pérez", estado: "Cerrado" },
      ];

      datosFake.forEach(ticket => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${ticket.id}</td>
          <td>${ticket.nombre}</td>
          <td>${ticket.estado}</td>
          <td><a href="#">Ver</a></td>
        `;
        tbody.appendChild(fila);
      });
    });
});