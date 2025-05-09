document.addEventListener("DOMContentLoaded", () => {
    
    // CARGA NAVBAR
    fetch("../components/navbar.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById("navbar-placeholder").innerHTML = html;
      });
  
    // OBTIENE ID DEL TICKET DESDE LA URL
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get("id");
  
    // MUESTRA EL TICKET ID
    document.getElementById("ticket-id").textContent = ticketId;
  
    // Simular datos (reemplazar por Supabase luego)
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