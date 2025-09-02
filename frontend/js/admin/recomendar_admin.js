import { supabase } from "/js/supabaseClient.js";

export function initRecomendar() {
  console.log('🚀 Inicializando sección Recomendar Partners...');
  
  // Inicializar funcionalidades básicas
  inicializarEventListeners();
  cargarDatosIniciales();
}

function inicializarEventListeners() {
  console.log('🔧 Configurando event listeners...');
  
  // Botón "Nuevo Partner"
  const btnNuevoPartner = document.getElementById('btnNuevoPartner');
  if (btnNuevoPartner) {
    btnNuevoPartner.addEventListener('click', () => {
      console.log('📝 Abriendo formulario de nuevo partner...');
      // TODO: Implementar modal/formulario para nuevo partner
    });
  }
  
  // Búsqueda de partners
  const buscadorPartners = document.getElementById('buscadorPartners');
  if (buscadorPartners) {
    buscadorPartners.addEventListener('input', (e) => {
      console.log('🔍 Buscando partners:', e.target.value);
      // TODO: Implementar búsqueda en tiempo real
    });
  }
  
  // Filtros
  const filtroEstado = document.getElementById('filtroEstado');
  const filtroCategoria = document.getElementById('filtroCategoria');
  
  if (filtroEstado) {
    filtroEstado.addEventListener('change', (e) => {
      console.log('🔽 Filtro estado cambiado:', e.target.value);
      // TODO: Implementar filtrado por estado
    });
  }
  
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', (e) => {
      console.log('🔽 Filtro categoría cambiado:', e.target.value);
      // TODO: Implementar filtrado por categoría
    });
  }
}

async function cargarDatosIniciales() {
  console.log('📊 Cargando datos iniciales...');
  
  try {
    // Cargar estadísticas básicas
    await cargarEstadisticas();
    
    // Cargar lista de partners
    await cargarPartners();
    
  } catch (error) {
    console.error('❌ Error cargando datos iniciales:', error);
  }
}

async function cargarEstadisticas() {
  console.log('📈 Cargando estadísticas...');
  
  try {
    // TODO: Implementar consultas a la base de datos para estadísticas
    // Por ahora, valores de ejemplo
    document.getElementById('totalPartners').textContent = '0';
    document.getElementById('partnersActivos').textContent = '0';
    document.getElementById('partnersPendientes').textContent = '0';
    
    document.getElementById('partnersNuevosMes').textContent = '+0 este mes';
    document.getElementById('porcentajePartnersActivos').textContent = '0% activos';
    document.getElementById('porcentajePartnersPendientes').textContent = '0% pendientes';
    
  } catch (error) {
    console.error('❌ Error cargando estadísticas:', error);
  }
}

async function cargarPartners() {
  console.log('👥 Cargando lista de partners...');
  
  try {
    // TODO: Implementar consulta a la base de datos para partners
    // Por ahora, mostrar mensaje de placeholder
    const tablaPartners = document.getElementById('tablaPartners');
    if (tablaPartners) {
      tablaPartners.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#d1d5db" viewBox="0 0 256 256">
                <path d="M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z"></path>
              </svg>
              <div>
                <h3 style="margin: 0; color: #374151;">No hay partners registrados</h3>
                <p style="margin: 0.5rem 0 0 0;">Comienza agregando tu primer partner recomendado</p>
              </div>
            </div>
          </td>
        </tr>
      `;
    }
    
  } catch (error) {
    console.error('❌ Error cargando partners:', error);
  }
}

// Funciones auxiliares que se pueden usar desde otros módulos
export function actualizarEstadisticas() {
  console.log('🔄 Actualizando estadísticas...');
  cargarEstadisticas();
}

export function actualizarListaPartners() {
  console.log('🔄 Actualizando lista de partners...');
  cargarPartners();
}
