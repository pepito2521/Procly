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

  const endpoints = [
    { url: '/tickets/kpi-total', id: 'kpi-total-tickets' },
    { url: '/tickets/kpi-entregados', id: 'kpi-tickets-entregados' },
    { url: '/tickets/kpi-en-proceso', id: 'kpi-tickets-proceso' },
    { url: '/tickets/kpi-cancelados', id: 'kpi-tickets-cancelados' }
  ];

  await Promise.all(endpoints.map(async ({ url, id }) => {
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      document.getElementById(id).textContent = data.total ?? 0;
    } catch (e) {
      document.getElementById(id).textContent = 0;
    }
  }));
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
          <a href="detalle_ticket.html?id=${ticket.ticket_id}" class="ver-icono">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#090B0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </td>
      `;
      tbody.appendChild(fila);
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

