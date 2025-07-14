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
      const [resTotales, resEntregados, resEnProceso, resCancelados, resTendencia, resPctEntregados, resPctEnCurso, resPctCancelados] = await Promise.all([
        fetch('/stats/tickets-totales', { headers }).then(r => r.json()),
        fetch('/stats/tickets-entregados', { headers }).then(r => r.json()),
        fetch('/stats/tickets-en-proceso', { headers }).then(r => r.json()),
        fetch('/stats/tickets-cancelados', { headers }).then(r => r.json()),
        fetch('/stats/tendencia-tickets-vs-mes-anterior', { headers }).then(r => r.json()),
        fetch('/stats/porcentaje-tickets-entregados', { headers }).then(r => r.json()),
        fetch('/stats/porcentaje-tickets-en-curso', { headers }).then(r => r.json()),
        fetch('/stats/porcentaje-tickets-cancelados', { headers }).then(r => r.json())
      ]);
      document.getElementById("actividadTotales").textContent = resTotales.total ?? 0;
      document.getElementById("actividadEntregados").textContent = resEntregados.total ?? 0;
      document.getElementById("actividadEnProceso").textContent = resEnProceso.total ?? 0;
      document.getElementById("actividadCancelados").textContent = resCancelados.total ?? 0;

      const tendencia = resTendencia.tendencia;
      document.getElementById("actividadTotalesSub").textContent =
        tendencia === undefined ? "-" :
        tendencia > 0 ? `▲ ${tendencia}% vs mes anterior` :
        tendencia < 0 ? `▼ ${Math.abs(tendencia)}% vs mes anterior` :
        `0% vs mes anterior`;
      document.getElementById("actividadEntregadosSub").textContent = `${resPctEntregados.porcentaje ?? 0}% del total`;
      document.getElementById("actividadEnProcesoSub").textContent = `${resPctEnCurso.porcentaje ?? 0}% del total`;
      document.getElementById("actividadCanceladosSub").textContent = `${resPctCancelados.porcentaje ?? 0}% del total`;
  
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
            <td><strong>${t.codigo_ticket}</strong></td>
            <td><strong>${t.nombre_ticket ?? ''}</strong></td>
            <td>${t.nombre} ${t.apellido}</td>
            <td><span class="badge ${getEstadoColor(t.estado)}">${t.estado}</span></td>
            <td>${t.precio}</td>
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