import { mostrarLoader, ocultarLoader } from '/js/components/loader.js';

export function initMisTickets() {
  cargarKPIsYTabla();
}

async function cargarKPIsYTabla() {
  await mostrarLoader();
  await Promise.all([
    cargarKPIs(),
    cargarTickets()
  ]);
  ocultarLoader();
}

async function cargarKPIs() {
  const token = localStorage.getItem('supabaseToken');
  if (!token) return;
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [total, entregados, enProceso, cancelados] = await Promise.all([
      fetch('https://www.procly.net/tickets/kpi-total', { headers }).then(r => r.json()),
      fetch('https://www.procly.net/tickets/kpi-entregados', { headers }).then(r => r.json()),
      fetch('https://www.procly.net/tickets/kpi-en-proceso', { headers }).then(r => r.json()),
      fetch('https://www.procly.net/tickets/kpi-cancelados', { headers }).then(r => r.json())
    ]);

    document.getElementById('kpi-total-tickets').textContent = total.total ?? 0;
    document.getElementById('kpi-tickets-entregados').textContent = entregados.total ?? 0;
    document.getElementById('kpi-tickets-proceso').textContent = enProceso.total ?? 0;
    document.getElementById('kpi-tickets-cancelados').textContent = cancelados.total ?? 0;
  } catch (e) {
  
    document.getElementById('kpi-total-tickets').textContent = 0;
    document.getElementById('kpi-tickets-entregados').textContent = 0;
    document.getElementById('kpi-tickets-proceso').textContent = 0;
    document.getElementById('kpi-tickets-cancelados').textContent = 0;
  }
}

async function cargarTickets() {
  const token = localStorage.getItem('supabaseToken');
  if (!token) return;
  try {
    const res = await fetch('/tickets', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tickets = await res.json();
    const tbody = document.getElementById("tickets-table-body");
    if (!tbody) {
      console.error("No se encontró el tbody de la tabla de tickets.");
      return;
    }
    tbody.innerHTML = "";

    if (!Array.isArray(tickets) || tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 1rem; color: #999;">Todavía no creaste ningún ticket.</td></tr>`;
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
        <td><div class="truncar-texto" title="${ticket.codigo_ticket || ticket.ticket_id}">${ticket.codigo_ticket || ticket.ticket_id}</div></td>
        <td>${ticket.nombre}</td>
        <td>
          <span class="estado-badge ${claseEstado}">
            ${ticket.estado}
          </span>
        </td>
        <td>
          <button type="button" class="ver-icono-container" data-ticket-id="${ticket.ticket_id}" title="Ver ticket">
            <span class="ver-icono">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </button>
        </td>
      `;
      tbody.appendChild(fila);

      const verBtn = fila.querySelector('.ver-icono-container');
      if (verBtn) {
        verBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const ticketId = verBtn.dataset.ticketId;
          cargarDetalleTicket(ticketId);
        });
      }
    });
  } catch (err) {
    document.getElementById("tickets-table-body").innerHTML = `<tr><td colspan="4">❌ Error al cargar tickets</td></tr>`;
  }
}

// BUSCADOR DE TICKETS
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === "buscadorTickets") {
    const valor = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tickets-table-body tr");
    filas.forEach((fila) => {
      const textoFila = fila.textContent.toLowerCase();
      fila.style.display = textoFila.includes(valor) ? "" : "none";
    });
  }
});

// FUNCION PARA CARGAR EL DETALLE DEL TICKET
async function cargarDetalleTicket(ticketId) {
  try {
    const response = await fetch('/app/user/components/detalle_ticket.html');
    const html = await response.text();
    document.getElementById('dynamicContent').innerHTML = html;

    // BOTON VOLVER A MIS TICKETS
    const btnVolver = document.getElementById('btn-volver-tickets');
    if (btnVolver) {
      btnVolver.addEventListener('click', () => {
        document.querySelector('.nav-item[data-section="mis_tickets"]')?.click();
      });
    }

    // Importar y ejecutar el JS del detalle
    const detalleModule = await import('/js/user/detalle_ticket.js');
    detalleModule.initDetalleTicket(ticketId);
    
  } catch (error) {
    console.error('Error al cargar detalle del ticket:', error);
    document.getElementById('dynamicContent').innerHTML = `
      <div class="error-detalle-ticket">
        <p>❌ Error al cargar el detalle del ticket</p>
        <p>${error.message || 'Ocurrió un error inesperado.'}</p>
      </div>
    `;
  }
}