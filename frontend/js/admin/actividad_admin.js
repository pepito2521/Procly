// ACTIVIDAD ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initActividad() {
  cargarActividadTemplate();
}

async function cargarActividadTemplate() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // Función helper para manejar fetch con mejor manejo de errores
    async function fetchWithErrorHandling(url, headers) {
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          console.warn(`Error HTTP ${response.status} para ${url}`);
          return null;
        }
        const text = await response.text();
        if (!text) {
          console.warn(`Respuesta vacía para ${url}`);
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.warn(`Error parseando JSON para ${url}:`, text);
          return null;
        }
      } catch (fetchError) {
        console.warn(`Error en fetch para ${url}:`, fetchError);
        return null;
      }
    }

    // Cargar KPIs y tickets en paralelo
    const [
      kpiTotal,
      kpiEntregados,
      kpiEnProceso,
      kpiCancelados,
      listadoTickets
    ] = await Promise.all([
      fetchWithErrorHandling('/stats/tickets-totales', headers),
      fetchWithErrorHandling('/stats/tickets-entregados', headers),
      fetchWithErrorHandling('/stats/tickets-en-proceso', headers),
      fetchWithErrorHandling('/stats/tickets-cancelados', headers),
      fetchWithErrorHandling('/stats/actividad-tickets', headers)
    ]);

    // Actualizar KPIs
    document.getElementById("actividadTotales").textContent = kpiTotal?.total ?? 0;
    document.getElementById("actividadEntregados").textContent = kpiEntregados?.total ?? 0;
    document.getElementById("actividadEnProceso").textContent = kpiEnProceso?.total ?? 0;
    document.getElementById("actividadCancelados").textContent = kpiCancelados?.total ?? 0;

    // Cargar tabla de tickets
    cargarTablaHistorial(listadoTickets?.tickets || []);

    // Inicializar eventos
    inicializarEventos();

    console.log('✅ Componente de actividad cargado correctamente');

  } catch (error) {
    console.error("Error al cargar actividad:", error);
    // Mostrar mensaje de error en la interfaz
    document.getElementById("actividadTotales").textContent = 'Error';
    document.getElementById("actividadEntregados").textContent = 'Error';
    document.getElementById("actividadEnProceso").textContent = 'Error';
    document.getElementById("actividadCancelados").textContent = 'Error';
  }
}

function cargarTablaHistorial(tickets) {
  const tbody = document.getElementById("tablaActividad");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!tickets || tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">⚠️ No hay tickets disponibles</td></tr>`;
    return;
  }

  tickets.forEach(ticket => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ticket.codigo_ticket || 'Sin código'}</td>
      <td>${ticket.nombre_ticket || 'Sin nombre'}</td>
      <td>${ticket.nombre || ''} ${ticket.apellido || ''}</td>
      <td>
        <span class="estado-badge ${ticket.estado?.toLowerCase() || 'creado'}">
          ${ticket.estado || 'Creado'}
        </span>
      </td>
      <td>${ticket.precio || 'En proceso'}</td>
    `;
    tbody.appendChild(row);
  });

  // Configurar buscador
  const inputBuscador = document.getElementById("buscadorTickets");
  if (inputBuscador) {
    inputBuscador.addEventListener("input", (e) => {
      const valor = e.target.value.toLowerCase();
      const filas = tbody.querySelectorAll("tr");
      filas.forEach((fila) => {
        const textoCodigo = fila.children[0]?.textContent.toLowerCase() ?? "";
        const textoNombre = fila.children[1]?.textContent.toLowerCase() ?? "";
        const textoUsuario = fila.children[2]?.textContent.toLowerCase() ?? "";
        
        const coincide = textoCodigo.includes(valor) || 
                        textoNombre.includes(valor) || 
                        textoUsuario.includes(valor);
        
        fila.style.display = coincide ? "" : "none";
      });
    });
  }
}

function inicializarEventos() {
  // Botón de exportar
  const btnExportar = document.getElementById("btnExportar");
  if (btnExportar) {
    btnExportar.addEventListener("click", exportarTickets);
    console.log('✅ Botón de exportar inicializado');
  }

  // Campo de búsqueda
  const inputBuscador = document.getElementById("buscadorTickets");
  if (inputBuscador) {
    console.log('✅ Campo de búsqueda inicializado');
  }

  console.log('✅ Eventos del componente de actividad inicializados');
}

async function exportarTickets() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Mostrar spinner
    const spinner = document.querySelector('.glass-loader');
    if (spinner) spinner.style.display = 'flex';

    const response = await fetch('/export/tickets', { headers });
    
    if (!response.ok) {
      throw new Error('Error al exportar tickets');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    mostrarNotificacion('✅ Tickets exportados correctamente', 'success');

  } catch (error) {
    console.error('Error al exportar:', error);
    mostrarNotificacion('❌ Error al exportar tickets', 'error');
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear notificación temporal
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion ${tipo}`;
  notificacion.textContent = mensaje;
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  document.body.appendChild(notificacion);

  // Remover después de 3 segundos
  setTimeout(() => {
    if (notificacion.parentNode) {
      notificacion.parentNode.removeChild(notificacion);
    }
  }, 3000);
}

