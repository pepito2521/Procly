// REGISTRO DE ACTIVIDAD ADMIN - COMPONENT

export function initActividad() {
  console.log('🔧 Inicializando componente de Registro de Actividad...');
  cargarEstadisticas();
  cargarTickets();
  inicializarEventos();
}

// Función para cargar estadísticas
async function cargarEstadisticas() {
  try {
    console.log('📊 Cargando estadísticas...');
    
    // Usar los endpoints del backend en lugar de consultas directas a Supabase
    const [totalRes, entregadosRes, enProcesoRes, canceladosRes] = await Promise.all([
      fetch('/stats/tickets-totales'),
      fetch('/stats/tickets-entregados'),
      fetch('/stats/tickets-en-proceso'),
      fetch('/stats/tickets-cancelados')
    ]);

    if (!totalRes.ok || !entregadosRes.ok || !enProcesoRes.ok || !canceladosRes.ok) {
      throw new Error('Error al obtener estadísticas del backend');
    }

    const total = await totalRes.json();
    const entregados = await entregadosRes.json();
    const enProceso = await enProcesoRes.json();
    const cancelados = await canceladosRes.json();
    
    // Actualizar UI
    document.getElementById('actividadTotales').textContent = total.total || 0;
    document.getElementById('actividadEntregados').textContent = entregados.total || 0;
    document.getElementById('actividadEnProceso').textContent = enProceso.total || 0;
    document.getElementById('actividadCancelados').textContent = cancelados.total || 0;
    
    // Calcular porcentajes
    const totalTickets = total.total || 0;
    const porcentajeEntregados = totalTickets > 0 ? Math.round((entregados.total / totalTickets) * 100) : 0;
    const porcentajeEnCurso = totalTickets > 0 ? Math.round((enProceso.total / totalTickets) * 100) : 0;
    const porcentajeCancelados = totalTickets > 0 ? Math.round((cancelados.total / totalTickets) * 100) : 0;
    
    document.getElementById('actividadTotalesSub').textContent = 'Total de tickets de la empresa';
    document.getElementById('actividadEntregadosSub').textContent = `${porcentajeEntregados}% del total`;
    document.getElementById('actividadEnProcesoSub').textContent = `${porcentajeEnCurso}% del total`;
    document.getElementById('actividadCanceladosSub').textContent = `${porcentajeCancelados}% del total`;
    
    console.log('✅ Estadísticas cargadas desde backend');
    
  } catch (error) {
    console.error('❌ Error al cargar estadísticas:', error);
  }
}

// Función para cargar tickets
async function cargarTickets() {
  try {
    console.log('📋 Cargando tickets...');
    
    // Usar el endpoint del backend en lugar de consultas directas a Supabase
    const response = await fetch('/stats/actividad-tickets');
    
    if (!response.ok) {
      throw new Error('Error al obtener tickets del backend');
    }
    
    const data = await response.json();
    const tickets = data.tickets || [];
    
    renderizarTickets(tickets);
    console.log(`✅ ${tickets.length} tickets cargados desde backend`);
    
  } catch (error) {
    console.error('❌ Error al cargar tickets:', error);
  }
}

// Función para renderizar tickets en la tabla
function renderizarTickets(tickets) {
  const tbody = document.getElementById('tablaActividad');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  tickets.forEach(ticket => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${ticket.codigo_ticket || 'N/A'}</td>
      <td>${ticket.nombre_ticket || 'N/A'}</td>
      <td>${ticket.nombre || 'N/A'} ${ticket.apellido || ''}</td>
      <td>
        <span class="estado-badge ${ticket.estado?.toLowerCase().replace(' ', '-')}">
          ${ticket.estado || 'N/A'}
        </span>
      </td>
      <td>${ticket.precio || 'En proceso'}</td>
    `;
    tbody.appendChild(row);
  });
}

// Función para exportar tickets a Excel
async function exportarTickets() {
  try {
    console.log('📤 Exportando tickets a Excel...');
    
    // Mostrar estado de carga en el botón
    const btnExportar = document.getElementById('btnExportar');
    const textoOriginal = btnExportar.innerHTML;
    btnExportar.disabled = true;
    btnExportar.innerHTML = `
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48ZM72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Zm152-40a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160ZM32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96ZM80,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,80,80Zm104,88V88a8,8,0,0,0-16,0v80a8,8,0,0,0,16,0ZM144,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,144,80Zm-32,0a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,112,80Z"></path>
      </svg>
      Exportando...
    `;
    
    // Determinar URL base según el entorno
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.procly.net';
    
    // Hacer request POST para exportar
    const response = await fetch(`${baseUrl}/api/export/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
    // Obtener el blob del archivo
    const blob = await response.blob();
    
    // Crear URL para descarga
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Obtener nombre del archivo
    const fileName = `tickets_procly_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.download = fileName;
    
    // Trigger descarga
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('✅ Archivo Excel descargado exitosamente');
    
    // Mostrar notificación de éxito
    mostrarNotificacion('Archivo Excel exportado correctamente', 'success');
    
  } catch (error) {
    console.error('❌ Error al exportar tickets:', error);
    mostrarNotificacion('Error al exportar tickets', 'error');
  } finally {
    // Restaurar botón
    const btnExportar = document.getElementById('btnExportar');
    btnExportar.disabled = false;
    btnExportar.innerHTML = textoOriginal;
  }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  if (tipo === 'success') {
    notificacion.style.background = '#10b981';
  } else if (tipo === 'error') {
    notificacion.style.background = '#ef4444';
  } else {
    notificacion.style.background = '#3b82f6';
  }
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    if (notificacion.parentNode) {
      notificacion.parentNode.removeChild(notificacion);
    }
  }, 3000);
}

// Función para buscar tickets
function buscarTickets(query) {
  const tbody = document.getElementById('tablaActividad');
  const rows = tbody.querySelectorAll('tr');
  
  rows.forEach(row => {
    const codigo = row.cells[0].textContent.toLowerCase();
    const nombre = row.cells[1].textContent.toLowerCase();
    const usuario = row.cells[2].textContent.toLowerCase();
    
    const match = codigo.includes(query.toLowerCase()) || 
                  nombre.includes(query.toLowerCase()) || 
                  usuario.includes(query.toLowerCase());
    
    row.style.display = match ? '' : 'none';
  });
}

// Función para inicializar eventos
function inicializarEventos() {
  // Botón de exportar
  const btnExportar = document.getElementById('btnExportar');
  if (btnExportar) {
    btnExportar.addEventListener('click', exportarTickets);
    console.log('✅ Botón de exportar inicializado');
  }
  
  // Campo de búsqueda
  const searchInput = document.getElementById('buscadorTickets');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      buscarTickets(e.target.value);
    });
    console.log('✅ Campo de búsqueda inicializado');
  }
  
  console.log('✅ Eventos del componente de actividad inicializados');
}

