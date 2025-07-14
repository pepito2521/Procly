document.addEventListener("seccion-cambiada", (e) => {
    if (e.detail === "actividad") {
      cargarActividadTemplate();
    }
  });

async function cargarActividadTemplate() {
    let tbody;
    try {
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        console.error("Token no disponible.");
        return;
      }
  
      const headers = { 'Authorization': `Bearer ${token}` };
  
      // 1. Cargar KPIs
      const [resEntregados, resEnProceso, resCancelados] = await Promise.all([
        fetch('/stats/tickets-entregados', { headers }).then(r => r.json()),
        fetch('/stats/tickets-en-proceso', { headers }).then(r => r.json()),
        fetch('/stats/tickets-cancelados', { headers }).then(r => r.json())
      ]);
      
      document.getElementById("actividadEntregados").textContent = resEntregados.total ?? 0;
      document.getElementById("actividadEnProceso").textContent = resEnProceso.total ?? 0;
      document.getElementById("actividadCancelados").textContent = resCancelados.total ?? 0;    
  
      // 2. Cargar Tabla
      const response = await fetch('/stats/actividad-tickets', { headers });
      const { tickets } = await response.json();
  
      tbody = document.getElementById("tablaActividad");
      tbody.innerHTML = "";
  
      if (!tickets || tickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">⚠️ No hay tickets registrados</td></tr>`;
        return;
      }
  
      tickets.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${t.codigo_ticket}</td>
          <td>${t.nombre} ${t.apellido}</td>
          <td>
            <span class="badge ${getEstadoColor(t.estado)}">${t.estado}</span>
          </td>
          <td>${t.categoria}</td>
          <td>
            ${t.precio_seleccionado != null && Number(t.precio_seleccionado) > 0
              ? `$${Number(t.precio_seleccionado).toLocaleString()}`
              : 'En proceso'}
          </td>
        `;
        tbody.appendChild(row);
      });
  
    } catch (error) {
      console.error("Error al cargar actividad:", error);
      document.getElementById("tablaActividad").innerHTML = `<tr><td colspan="5">❌ Error al cargar actividad</td></tr>`;
    }

    // BUSCADOR DE TICKETS
    const inputBuscador = document.getElementById("buscadorTickets");
    inputBuscador && (inputBuscador.oninput = (e) => {
      const valor = e.target.value.toLowerCase();
      const filas = tbody.querySelectorAll("tr");
      filas.forEach((fila) => {
        const textoCodigo = fila.children[0]?.textContent.toLowerCase() ?? "";
        fila.style.display = textoCodigo.includes(valor) ? "" : "none";
      });
    });
  }
  
  // Utilidad: color según estado
  function getEstadoColor(estado) {
    switch (estado) {
      case 'pendiente':
        return 'badge-warning';
      case 'en revisión':
        return 'badge-secondary';
      case 'entregado':
        return 'badge-success';
      default:
        return 'badge-default';
    }
  }