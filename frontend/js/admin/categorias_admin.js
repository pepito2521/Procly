// CATEGORÍAS ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initCategorias() {
  console.log('🔧 Inicializando componente de categorías...');
  cargarCategorias();
  inicializarEventos();
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
  card.className = 'categoria-card';
  card.setAttribute('data-id', categoria.id);

  // Imagen de fondo desde Supabase Storage
  let bgStyle;
  if (categoria.imagen && categoria.imagen.includes('/storage/')) {
    // Es una imagen de Supabase Storage
    // Corregir la ruta: cambiar 'images' por 'imagen' para que coincida con el bucket
    const correctedPath = categoria.imagen.replace('/images/', '/imagen/');
    // Usar la URL de Supabase desde la configuración del cliente
    const supabaseUrl = supabase.supabaseUrl;
    const fullUrl = `${supabaseUrl}${correctedPath}`;
    bgStyle = `background-image: url('${fullUrl}')`;
  } else if (categoria.imagen && categoria.imagen.startsWith('http')) {
    // Es una URL completa
    bgStyle = `background-image: url('${categoria.imagen}')`;
  } else {
    // Fallback a gradiente
    bgStyle = `background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`;
  }

  // Icono personalizado desde Supabase Storage
  let iconoHTML;
  if (categoria.icon && categoria.icon.includes('/storage/')) {
    // Es un icono de Supabase Storage
    const correctedIconPath = categoria.icon.replace('/images/', '/icon/');
    const supabaseUrl = supabase.supabaseUrl;
    const fullIconUrl = `${supabaseUrl}${correctedIconPath}`;
    iconoHTML = `<img src="${fullIconUrl}" alt="Icono ${categoria.nombre}" width="16" height="16" style="fill: currentColor;">`;
  } else if (categoria.icon && categoria.icon.startsWith('http')) {
    // Es una URL completa
    iconoHTML = `<img src="${categoria.icon}" alt="Icono ${categoria.nombre}" width="16" height="16" style="fill: currentColor;">`;
  } else {
    // Fallback al SVG genérico
    iconoHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,8.27,8.27,0,0,1-3.12-.62,8.66,8.66,0,0,1-4.88-4.88A8,8,0,0,1,128,152a8,8,0,0,1,8,8Zm-8-88a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V96A8,8,0,0,1,136,88Z"></path>
    </svg>`;
  }

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
        ${iconoHTML}
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
      alert('Usuario no autenticado');
      return;
    }

    // Actualizar el estado de habilitación en empresa_categorias
    const { error: errorUpdate } = await supabase
      .from('empresa_categorias')
      .upsert({
        empresa_id: user.id,
        categoria_id: categoriaId,
        habilitada: habilitada
      });

    if (errorUpdate) {
      console.error('❌ Error al actualizar estado de categoría:', errorUpdate);
      alert('Error al actualizar el estado de la categoría');
      return;
    }

    // Actualizar el array local
    categoria.habilitada = habilitada;
    categoria.nombre = nombre;
    categoria.descripcion = descripcion;

    // Recargar las categorías para reflejar los cambios
    await cargarCategorias();

    // Cerrar el modal
    cerrarModal();

    // Mostrar notificación de éxito
    mostrarNotificacion('Categoría actualizada correctamente', 'success');

  } catch (error) {
    console.error('❌ Error al guardar cambios:', error);
    alert('Error al guardar los cambios');
  }
}

// Función para cerrar el modal
function cerrarModal() {
  document.getElementById('modalCategoria').style.display = 'none';
  document.getElementById('modalCategoria').removeAttribute('data-editando');
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  console.log(`${tipo.toUpperCase()}: ${mensaje}`);
}

// Función para inicializar eventos
function inicializarEventos() {
  // Evento para cerrar modal
  const modal = document.getElementById('modalCategoria');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModal();
      }
    });
  }

  // Evento para botón de guardar
  const btnGuardar = document.getElementById('btnGuardarCategoria');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarCambiosCategoria);
  }

  // Evento para botón de cancelar
  const btnCancelar = document.getElementById('btnCancelarCategoria');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', cerrarModal);
  }

  console.log('✅ Eventos del componente de categorías inicializados');
}

// Función para agregar botón de refresh
function agregarBotonRefresh() {
  const header = document.querySelector('.categorias-header');
  if (!header) return;

  // Verificar si ya existe el botón
  if (document.getElementById('btnRefresh')) return;

  const btnRefresh = document.createElement('button');
  btnRefresh.id = 'btnRefresh';
  btnRefresh.className = 'btn-verde';
  btnRefresh.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
      <path d="M224,128a96,96,0,0,1-94.71,95.27c-2.62,0-5.22-.08-7.8-.24a8,8,0,0,1-6.69-9.26,85.85,85.85,0,0,0,20.6-85.49,8,8,0,0,1,6.29-10.1,8.14,8.14,0,0,1,1.4-.12,8,8,0,0,1,7.87,6.7A80.09,80.09,0,0,0,176,128a8,8,0,0,1,16,0Zm-40,40a8,8,0,0,0-8,8v24H152a8,8,0,0,0,0,16h24a8,8,0,0,0,8-8V176A8,8,0,0,0,184,168Zm-64,56H96a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Zm-32-16H64a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path>
    </svg>
    Actualizar
  `;

  btnRefresh.addEventListener('click', () => {
    btnRefresh.disabled = true;
    btnRefresh.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a96,96,0,0,1-94.71,95.27c-2.62,0-5.22-.08-7.8-.24a8,8,0,0,1-6.69-9.26,85.85,85.85,0,0,0,20.6-85.49,8,8,0,0,1,6.29-10.1,8.14,8.14,0,0,1,1.4-.12,8,8,0,0,1,7.87,6.7A80.09,80.09,0,0,0,176,128a8,8,0,0,1,16,0Zm-40,40a8,8,0,0,0-8,8v24H152a8,8,0,0,0,0,16h24a8,8,0,0,0,8-8V176A8,8,0,0,0,184,168Zm-64,56H96a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Zm-32-16H64a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path>
      </svg>
      Actualizando...
    `;
    
    cargarCategorias().finally(() => {
      btnRefresh.disabled = false;
      btnRefresh.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M224,128a96,96,0,0,1-94.71,95.27c-2.62,0-5.22-.08-7.8-.24a8,8,0,0,1-6.69-9.26,85.85,85.85,0,0,0,20.6-85.49,8,8,0,0,1,6.29-10.1,8.14,8.14,0,0,1,1.4-.12,8,8,0,0,1,7.87,6.7A80.09,80.09,0,0,0,176,128a8,8,0,0,1,16,0Zm-40,40a8,8,0,0,0-8,8v24H152a8,8,0,0,0,0,16h24a8,8,0,0,0,8-8V176A8,8,0,0,0,184,168Zm-64,56H96a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Zm-32-16H64a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path>
        </svg>
        Actualizar
      `;
    });
  });

  // Insertar antes del botón "Nueva Categoría"
  const btnNuevaCategoria = header.querySelector('.btn-verde:last-child');
  if (btnNuevaCategoria) {
    header.insertBefore(btnRefresh, btnNuevaCategoria);
  } else {
    header.appendChild(btnRefresh);
  }

  console.log('✅ Botón de refresh agregado');
}
