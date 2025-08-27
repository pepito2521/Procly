// CATEGORÍAS ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initCategorias() {
  console.log('🔧 Inicializando componente de categorías...');
  cargarCategorias();
  inicializarEventos();
}

// Datos de las categorías (por ahora hardcodeados, después se pueden cargar desde la BD)
const categoriasData = [
  {
    id: 'tecnologia',
    nombre: 'Tecnología',
    descripcion: 'Equipos informáticos, software y accesorios tecnológicos',
    habilitada: true,
    imagen: '/assets/img/categorias/tecnologia.webp',
    icon: '💻'
  },
  {
    id: 'ferreteria',
    nombre: 'Ferretería',
    descripcion: 'Herramientas, materiales de construcción y suministros industriales',
    habilitada: true,
    imagen: '/assets/img/categorias/ferreteria.webp',
    icon: '🔧'
  },
  {
    id: 'merchandising',
    nombre: 'Merchandising',
    descripcion: 'Productos promocionales y material de marketing',
    habilitada: true,
    imagen: '/assets/img/categorias/merchandising.webp',
    icon: '🎁'
  },
  {
    id: 'libreria',
    nombre: 'Librería',
    descripcion: 'Papelería, libros y material de oficina',
    habilitada: true,
    imagen: '/assets/img/categorias/libreria.webp',
    icon: '📚'
  },
  {
    id: 'eventos',
    nombre: 'Eventos',
    descripcion: 'Servicios y productos para eventos corporativos',
    habilitada: true,
    imagen: '/assets/img/categorias/eventos.webp',
    icon: '🎪'
  },
  {
    id: 'catering',
    nombre: 'Catering',
    descripcion: 'Servicios de alimentación y bebidas para eventos',
    habilitada: false,
    imagen: '/assets/img/categorias/catering.webp',
    icon: '🍽️'
  },
  {
    id: 'epp',
    nombre: 'EPP',
    descripcion: 'Equipos de protección personal y seguridad laboral',
    habilitada: true,
    imagen: '/assets/img/categorias/epp.webp',
    icon: '🦺'
  },
  {
    id: 'limpieza',
    nombre: 'Limpieza',
    descripcion: 'Productos y servicios de limpieza e higiene',
    habilitada: true,
    imagen: '/assets/img/categorias/limpieza.webp',
    icon: '🧹'
  },
  {
    id: 'supermercado',
    nombre: 'Supermercado',
    descripcion: 'Productos de consumo diario y alimentos',
    habilitada: true,
    imagen: '/assets/img/categorias/supermercado.webp',
    icon: '🛒'
  },
  {
    id: 'salud',
    nombre: 'Salud',
    descripcion: 'Productos médicos y de cuidado personal',
    habilitada: true,
    imagen: '/assets/img/categorias/salud.webp',
    icon: '🏥'
  },
  {
    id: 'courier',
    nombre: 'Courier',
    descripcion: 'Servicios de mensajería y envíos',
    habilitada: true,
    imagen: '/assets/img/categorias/courier.webp',
    icon: '📦'
  },
  {
    id: 'otros',
    nombre: 'Otros',
    descripcion: 'Categorías adicionales y servicios especializados',
    habilitada: false,
    imagen: '/assets/img/categorias/otros.webp',
    icon: '📋'
  }
];

// Función para cargar las categorías en el grid
function cargarCategorias() {
  const grid = document.getElementById('categoriasGrid');
  if (!grid) return;

  grid.innerHTML = '';

  categoriasData.forEach(categoria => {
    const card = crearTarjetaCategoria(categoria);
    grid.appendChild(card);
  });

  console.log(`✅ ${categoriasData.length} categorías cargadas`);
}

// Función para crear una tarjeta de categoría
function crearTarjetaCategoria(categoria) {
  const card = document.createElement('div');
  card.className = `categoria-card ${categoria.habilitada ? '' : 'disabled'}`;
  card.setAttribute('data-id', categoria.id);

  // Imagen de fondo (por defecto un color sólido si no hay imagen)
  const bgStyle = categoria.imagen && categoria.imagen !== '/assets/img/categorias/default.jpg' 
    ? `background-image: url('${categoria.imagen}')` 
    : `background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`;

  card.innerHTML = `
    <div class="categoria-bg" style="${bgStyle}"></div>
    <div class="categoria-overlay"></div>
    
    ${!categoria.habilitada ? `
      <div class="categoria-disabled-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
          <path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.25,9.38,123.11,8.17,125.46A8,8,0,0,0,8,128a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V88.94L202.08,221.38a8,8,0,1,0,11.84-10.76ZM112,200H24.61C33.81,185.55,45.35,168.68,58.41,150.22L112,200Zm0-16V88.94L112,200Z"></path>
        </svg>
      </div>
    ` : ''}
    
    <div class="categoria-content">
      <div class="categoria-info-icon" onclick="editarCategoria('${categoria.id}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,8.27,8.27,0,0,1-3.12-.62,8.66,8.66,0,0,1-4.88-4.88A8,8,0,0,1,128,152a8,8,0,0,1,8,8Zm-8-88a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V96A8,8,0,0,1,136,88Z"></path>
        </svg>
      </div>
      
      <h3 class="categoria-nombre">${categoria.nombre}</h3>
      
      <div class="categoria-estado">
        <span class="categoria-estado-badge ${categoria.habilitada ? 'habilitada' : 'deshabilitada'}">
          ${categoria.habilitada ? 'Habilitada' : 'Deshabilitada'}
        </span>
      </div>
    </div>
  `;

  // Agregar evento click para editar
  card.addEventListener('click', () => editarCategoria(categoria.id));

  return card;
}

// Función para editar una categoría
function editarCategoria(categoriaId) {
  const categoria = categoriasData.find(c => c.id === categoriaId);
  if (!categoria) return;

  // Llenar el modal con los datos de la categoría
  document.getElementById('categoriaNombre').value = categoria.nombre;
  document.getElementById('categoriaDescripcion').value = categoria.descripcion;
  document.getElementById('categoriaHabilitada').checked = categoria.habilitada;
  
  // Actualizar el título del modal
  document.getElementById('modalTitle').textContent = `Editar Categoría: ${categoria.nombre}`;
  
  // Mostrar el modal
  document.getElementById('modalCategoria').style.display = 'flex';
  
  // Guardar el ID de la categoría que se está editando
  document.getElementById('modalCategoria').setAttribute('data-editando', categoriaId);
}

// Función para guardar cambios de la categoría
async function guardarCambiosCategoria() {
  const categoriaId = document.getElementById('modalCategoria').getAttribute('data-editando');
  const categoria = categoriasData.find(c => c.id === categoriaId);
  
  if (!categoria) return;

  // Obtener valores del formulario
  const nombre = document.getElementById('categoriaNombre').value.trim();
  const descripcion = document.getElementById('categoriaDescripcion').value.trim();
  const habilitada = document.getElementById('categoriaHabilitada').checked;

  // Validaciones básicas
  if (!nombre) {
    alert('El nombre de la categoría es obligatorio');
    return;
  }

  try {
    // Aquí se haría la llamada a la API para actualizar la categoría
    // Por ahora solo actualizamos el array local
    
    // Actualizar datos locales
    categoria.nombre = nombre;
    categoria.descripcion = descripcion;
    categoria.habilitada = habilitada;

    // Recargar el grid para mostrar los cambios
    cargarCategorias();

    // Cerrar el modal
    cerrarModal();

    // Mostrar mensaje de éxito
    mostrarNotificacion('Categoría actualizada correctamente', 'success');

    console.log(`✅ Categoría ${categoriaId} actualizada:`, categoria);

  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error);
    mostrarNotificacion('Error al actualizar la categoría', 'error');
  }
}

// Función para cerrar el modal
function cerrarModal() {
  document.getElementById('modalCategoria').style.display = 'none';
  document.getElementById('modalCategoria').removeAttribute('data-editando');
  
  // Limpiar formulario
  document.getElementById('categoriaNombre').value = '';
  document.getElementById('categoriaDescripcion').value = '';
  document.getElementById('categoriaHabilitada').checked = false;
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  
  // Agregar estilos básicos
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
  
  // Colores según tipo
  if (tipo === 'success') {
    notificacion.style.background = '#10b981';
  } else if (tipo === 'error') {
    notificacion.style.background = '#ef4444';
  } else {
    notificacion.style.background = '#3b82f6';
  }
  
  // Agregar al DOM
  document.body.appendChild(notificacion);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    if (notificacion.parentNode) {
      notificacion.parentNode.removeChild(notificacion);
    }
  }, 3000);
}

// Función para inicializar todos los eventos
function inicializarEventos() {
  // Botón Nueva Categoría
  const btnNuevaCategoria = document.getElementById('nuevaCategoriaBtn');
  if (btnNuevaCategoria) {
    btnNuevaCategoria.addEventListener('click', () => {
      alert('Funcionalidad de Nueva Categoría próximamente disponible');
    });
  }

  // Modal de edición
  const modal = document.getElementById('modalCategoria');
  const modalClose = document.getElementById('modalClose');
  const modalCancelar = document.getElementById('modalCancelar');
  const modalGuardar = document.getElementById('modalGuardar');

  if (modalClose) {
    modalClose.addEventListener('click', cerrarModal);
  }

  if (modalCancelar) {
    modalCancelar.addEventListener('click', cerrarModal);
  }

  if (modalGuardar) {
    modalGuardar.addEventListener('click', guardarCambiosCategoria);
  }

  // Cerrar modal al hacer click fuera
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModal();
      }
    });
  }

  console.log('✅ Eventos del componente de categorías inicializados');
}

// Hacer las funciones disponibles globalmente para el onclick del HTML
window.editarCategoria = editarCategoria;
