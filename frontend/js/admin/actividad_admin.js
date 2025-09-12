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

    // Función helper para manejar fetch con mejor manejo de errores y cache busting
    async function fetchWithErrorHandling(url, headers) {
      try {
        // Cache busting para evitar problemas de cache
        const timestamp = Date.now();
        const separator = url.includes('?') ? '&' : '?';
        const urlWithCacheBusting = `${url}${separator}t=${timestamp}`;
        
        const headersWithCache = {
          ...headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
        
        console.log(`🌐 Haciendo petición a: ${urlWithCacheBusting}`);
        const response = await fetch(urlWithCacheBusting, { headers: headersWithCache });
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
    
    // Cargar KPIs, porcentajes y tickets en paralelo
    const [
      kpiTotal,
      kpiEntregados,
      kpiEnProceso,
      kpiCancelados,
      porcentajeEntregados,
      porcentajeEnProceso,
      porcentajeCancelados,
      listadoTickets
    ] = await Promise.all([
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-totales`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-entregados`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-en-proceso`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/tickets-cancelados`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/porcentaje-tickets-entregados`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/porcentaje-tickets-en-curso`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/porcentaje-tickets-cancelados`, headers),
      fetchWithErrorHandling(`${baseUrl}/stats/actividad-tickets`, headers)
    ]);
    
    console.log('📊 Resultados de peticiones:', {
      kpiTotal: kpiTotal ? '✅' : '❌',
      kpiEntregados: kpiEntregados ? '✅' : '❌',
      kpiEnProceso: kpiEnProceso ? '✅' : '❌',
      kpiCancelados: kpiCancelados ? '✅' : '❌',
      porcentajeEntregados: porcentajeEntregados ? '✅' : '❌',
      porcentajeEnProceso: porcentajeEnProceso ? '✅' : '❌',
      porcentajeCancelados: porcentajeCancelados ? '✅' : '❌',
      listadoTickets: listadoTickets ? '✅' : '❌'
    });

    // Obtener valores de los KPIs
    const totalTickets = kpiTotal?.total ?? 0;
    const ticketsEntregados = kpiEntregados?.total ?? 0;
    const ticketsEnProceso = kpiEnProceso?.total ?? 0;
    const ticketsCancelados = kpiCancelados?.total ?? 0;

    // Obtener porcentajes del backend
    const porcentajeEntregadosValue = porcentajeEntregados?.porcentaje ?? 0;
    const porcentajeEnProcesoValue = porcentajeEnProceso?.porcentaje ?? 0;
    const porcentajeCanceladosValue = porcentajeCancelados?.porcentaje ?? 0;

    // Actualizar valores de los KPIs
    document.getElementById("actividadTotales").textContent = totalTickets;
    document.getElementById("actividadEntregados").textContent = ticketsEntregados;
    document.getElementById("actividadEnProceso").textContent = ticketsEnProceso;
    document.getElementById("actividadCancelados").textContent = ticketsCancelados;

    // Actualizar summary-subtext con porcentajes del backend
    document.getElementById("actividadTotalesSub").textContent = "Total de tickets en el sistema";
    document.getElementById("actividadEntregadosSub").textContent = `${porcentajeEntregadosValue}% del total de tickets`;
    document.getElementById("actividadEnProcesoSub").textContent = `${porcentajeEnProcesoValue}% del total de tickets`;
    document.getElementById("actividadCanceladosSub").textContent = `${porcentajeCanceladosValue}% del total de tickets`;
    
    console.log('📝 Summary-subtext actualizados correctamente');

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
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#d1d5db" viewBox="0 0 256 256">
              <path d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z"></path>
            </svg>
            <div>
              <h3 style="margin: 0; color: #374151;">No hay tickets disponibles</h3>
              <p style="margin: 0.5rem 0 0 0;">Los tickets aparecerán aquí cuando se creen</p>
            </div>
          </div>
        </td>
      </tr>
    `;
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

