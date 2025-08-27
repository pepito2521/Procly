// CATEGORÍAS ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initCategorias() {
  console.log('🔧 Inicializando componente de categorías...');
  cargarCategorias();
  inicializarEventos();
  
  // Agregar botón de refresh si no existe
  agregarBotonRefresh();
}

// Array para almacenar las categorías cargadas desde Supabase
let categoriasData = [];

// Función para cargar las categorías desde Supabase
async function cargarCategorias() {
  try {
    console.log('🔄 Cargando categorías desde Supabase...');
    
    // Obtener categorías desde la tabla categorias
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('id, nombre, descripcion, imagen, icon')
      .order('nombre', { ascending: true });
    
    if (error) {
      console.error('❌ Error al obtener categorías desde Supabase:', error);
      mostrarNotificacion('Error al cargar categorías', 'error');
      return;
    }
    
    // Obtener el estado de habilitación desde empresa_categorias para la empresa actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: empresaCategorias, error: errorEmpresa } = await supabase
        .from('empresa_categorias')
        .select('categoria_id, habilitada')
        .eq('empresa_id', user.id);
      
      if (errorEmpresa) {
        console.error('❌ Error al obtener estado de categorías de empresa:', errorEmpresa);
      } else {
        // Mapear el estado de habilitación a las categorías
        categorias.forEach(categoria => {
          const empresaCat = empresaCategorias?.find(ec => ec.categoria_id === categoria.id);
          categoria.habilitada = empresaCat ? empresaCat.habilitada : true; // Por defecto habilitada
        });
      }
    }
    
    // Actualizar el array global
    categoriasData = categorias || [];
    
    // Renderizar en el grid
    const grid = document.getElementById('categoriasGrid');
    if (!grid) return;

    grid.innerHTML = '';

    categoriasData.forEach(categoria => {
      const card = crearTarjetaCategoria(categoria);
      grid.appendChild(card);
    });

    console.log(`✅ ${categoriasData.length} categorías cargadas desde Supabase`);
    
  } catch (error) {
    console.error('❌ Error al cargar categorías:', error);
    mostrarNotificacion('Error al cargar categorías', 'error');
  }
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
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Actualizar la categoría en la tabla empresa_categorias
    const { error: updateError } = await supabase
      .from('empresa_categorias')
      .upsert({
        empresa_id: user.id,
        categoria_id: categoriaId,
        habilitada: habilitada
      }, {
        onConflict: 'empresa_id,categoria_id'
      });

    if (updateError) {
      throw new Error(`Error al actualizar estado: ${updateError.message}`);
    }

    // Actualizar datos locales
    categoria.nombre = nombre;
    categoria.descripcion = descripcion;
    categoria.habilitada = habilitada;

    // Recargar el grid para mostrar los cambios
    await cargarCategorias();

    // Cerrar el modal
    cerrarModal();

    // Mostrar mensaje de éxito
    mostrarNotificacion('Categoría actualizada correctamente', 'success');

    console.log(`✅ Categoría ${categoriaId} actualizada en Supabase:`, categoria);

  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error);
    mostrarNotificacion(`Error al actualizar la categoría: ${error.message}`, 'error');
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
      // Por ahora solo mostrar mensaje, pero aquí se podría implementar
      // la funcionalidad para crear nuevas categorías globales
      alert('Para crear nuevas categorías globales, contacta al administrador del sistema. Las categorías se crean desde Supabase y se replican automáticamente aquí.');
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

// Función para agregar botón de refresh
function agregarBotonRefresh() {
  const header = document.querySelector('.categorias-header');
  if (!header) return;
  
  // Verificar si ya existe el botón
  if (document.getElementById('refreshCategoriasBtn')) return;
  
  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'refreshCategoriasBtn';
  refreshBtn.className = 'btn-gris';
  refreshBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
      <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
    </svg>
    Actualizar
  `;
  
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = `
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
      </svg>
      Actualizando...
    `;
    
    try {
      await cargarCategorias();
      mostrarNotificacion('Categorías actualizadas correctamente', 'success');
    } catch (error) {
      console.error('❌ Error al actualizar categorías:', error);
      mostrarNotificacion('Error al actualizar categorías', 'error');
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
        </svg>
        Actualizar
      `;
    }
  });
  
  // Insertar antes del botón Nueva Categoría
  const nuevaCategoriaBtn = document.getElementById('nuevaCategoriaBtn');
  if (nuevaCategoriaBtn) {
    header.insertBefore(refreshBtn, nuevaCategoriaBtn);
  } else {
    header.appendChild(refreshBtn);
  }
  
  console.log('✅ Botón de refresh agregado');
}

// Hacer las funciones disponibles globalmente para el onclick del HTML
window.editarCategoria = editarCategoria;
