// ACTIVIDAD ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initActividad() {
  cargarActividadTemplate();
}

async function cargarActividadTemplate() {
  try {
    console.log('🔄 Iniciando carga de actividad...');
    
    // Detectar si estamos en localhost o producción
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.procly.net';
    console.log('🌐 Base URL detectada:', baseUrl);
    
    const token = localStorage.getItem('supabaseToken');
    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
    if (!token) {
      console.error("❌ Token no disponible.");
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    console.log('📋 Headers configurados:', headers);

    // Función helper para manejar fetch con mejor manejo de errores
    async function fetchWithErrorHandling(url, headers) {
      try {
        console.log(`🌐 Haciendo petición a: ${url}`);
        const response = await fetch(url, { headers });
        console.log(`📡 Respuesta de ${url}:`, response.status, response.statusText);
        
        if (!response.ok) {
          console.warn(`❌ Error HTTP ${response.status} para ${url}`);
          return null;
        }
        
        const text = await response.text();
        console.log(`📄 Contenido de ${url}:`, text.substring(0, 100) + '...');
        
        if (!text) {
          console.warn(`⚠️ Respuesta vacía para ${url}`);
          return null;
        }
        
        try {
          const parsed = JSON.parse(text);
          console.log(`✅ JSON parseado correctamente para ${url}`);
          return parsed;
        } catch (parseError) {
          console.warn(`❌ Error parseando JSON para ${url}:`, text);
          return null;
        }
      } catch (fetchError) {
        console.warn(`💥 Error en fetch para ${url}:`, fetchError);
        return null;
      }
    }

    console.log('🚀 Iniciando peticiones a endpoints...');
    
    // Cargar KPIs y tickets en paralelo
    const [
      kpiTotal,
      kpiEntregados,
      kpiEnProceso,
      kpiCancelados,
      listadoTickets
    ] = await Promise.all([
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-totales`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-entregados`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-en-proceso`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-cancelados`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/actividad-tickets`, headers)
    ]);
    
    console.log('📊 Resultados de peticiones:', {
      kpiTotal: kpiTotal ? '✅' : '❌',
      kpiEntregados: kpiEntregados ? '✅' : '❌',
      kpiEnProceso: kpiEnProceso ? '✅' : '❌',
      kpiCancelados: kpiCancelados ? '✅' : '❌',
      listadoTickets: listadoTickets ? '✅' : '❌'
    });

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

  // Función para mapear estados a clases CSS
  function getEstadoClass(estado) {
    if (!estado) return 'creado';
    
    const estadoLower = estado.toLowerCase();
    
    // Mapeo específico para estados con espacios
    if (estadoLower === 'en camino') return 'en-camino';
    if (estadoLower === 'en proceso') return 'en-proceso';
    if (estadoLower === 'en progreso') return 'en-progreso';
    
    // Para otros estados, usar el estado en minúsculas
    return estadoLower;
  }

  tickets.forEach(ticket => {
    const estadoClass = getEstadoClass(ticket.estado);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ticket.codigo_ticket || 'Sin código'}</td>
      <td>${ticket.nombre_ticket || 'Sin nombre'}</td>
      <td>${ticket.nombre || ''} ${ticket.apellido || ''}</td>
      <td>
        <span class="estado-badge ${estadoClass}">
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
    // Detectar si estamos en localhost o producción
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.procly.net';
    
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Mostrar spinner usando el glass-loader global
    const spinner = document.getElementById('exportSpinner');
    if (spinner) spinner.style.display = 'flex';

    const response = await fetch(`${baseUrl}/api/export/tickets`, { headers });
    
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
    // Ocultar spinner de forma segura
    const spinner = document.getElementById('exportSpinner');
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

