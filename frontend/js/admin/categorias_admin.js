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
      // Obtener el perfil del usuario para obtener empresa_id
      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('profile_id', user.id)
        .single();

      if (perfilError || !perfil?.empresa_id) {
        console.error('❌ Error al obtener empresa_id del usuario:', perfilError);
        // Si no se puede obtener empresa_id, usar todas las categorías como habilitadas por defecto
        categorias.forEach(categoria => {
          categoria.habilitada = true;
        });
      } else {
        const { data: empresaCategorias, error: errorEmpresa } = await supabase
          .from('empresa_categorias')
          .select('categoria_id, habilitada')
          .eq('empresa_id', perfil.empresa_id);
        
        if (errorEmpresa) {
          console.error('❌ Error al obtener estado de categorías de empresa:', errorEmpresa);
          // En caso de error, usar todas las categorías como habilitadas por defecto
          categorias.forEach(categoria => {
            categoria.habilitada = true;
          });
        } else {
          // Si no hay registros en empresa_categorias, inicializar todas como habilitadas
          if (!empresaCategorias || empresaCategorias.length === 0) {
            console.log('🔄 Inicializando categorías para la empresa:', perfil.empresa_id);
            await inicializarCategoriasEmpresa(perfil.empresa_id, categorias);
            // Después de inicializar, todas están habilitadas
            categorias.forEach(categoria => {
              categoria.habilitada = true;
            });
          } else {
            // Mapear el estado de habilitación existente
            categorias.forEach(categoria => {
              const empresaCat = empresaCategorias?.find(ec => ec.categoria_id === categoria.id);
              categoria.habilitada = empresaCat ? empresaCat.habilitada : true; // Por defecto habilitada
            });
          }
        }
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
    
    // Configurar tooltips DESPUÉS de renderizar las categorías
    configurarTooltipsCategorias();
    
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
    console.log('🔍 Debug icono:', {
      categoria: categoria.nombre,
      icon: categoria.icon,
      correctedPath: correctedIconPath,
      supabaseUrl: supabaseUrl,
      fullIconUrl: fullIconUrl
    });
    iconoHTML = `<img src="${fullIconUrl}" alt="Icono ${categoria.nombre}" width="16" height="16" style="fill: currentColor;">`;
  } else if (categoria.icon && categoria.icon.startsWith('http')) {
    // Es una URL completa
    console.log('🔍 Debug icono URL completa:', {
      categoria: categoria.nombre,
      icon: categoria.icon
    });
    iconoHTML = `<img src="${categoria.icon}" alt="Icono ${categoria.nombre}" width="16" height="16" style="fill: currentColor;">`;
  } else {
    // Fallback al SVG genérico
    console.log('🔍 Debug icono fallback:', {
      categoria: categoria.nombre,
      icon: categoria.icon,
      tieneIcon: !!categoria.icon
    });
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
      <div class="categoria-info-icon" data-info="${categoria.descripcion || 'Sin descripción disponible.'}">
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

  // Agregar evento click para abrir pop-up de gestión
  card.addEventListener('click', () => abrirPopUpCategoria(categoria));

  return card;
}

// Función para abrir pop-up de gestión de categoría
function abrirPopUpCategoria(categoria) {
  if (!categoria) return;

  // Llenar el pop-up con los datos de la categoría
  document.getElementById('popup-categoria-titulo').textContent = `Gestionar: ${categoria.nombre}`;
  document.getElementById('popup-categoria-descripcion').textContent = `Configura el estado de la categoría "${categoria.nombre}"`;
  
  // Configurar el toggle
  const toggle = document.getElementById('popup-categoria-toggle');
  const toggleText = document.getElementById('popup-categoria-toggle-text');
  
  toggle.checked = categoria.habilitada;
  toggleText.textContent = categoria.habilitada ? 'Categoría habilitada' : 'Categoría deshabilitada';
  
  // Guardar el ID de la categoría que se está editando
  document.getElementById('pop-up-categoria').setAttribute('data-editando', categoria.id);
  
  // Mostrar el pop-up
  document.getElementById('pop-up-categoria').style.display = 'flex';
}

// Función para guardar cambios de la categoría
async function guardarCambiosCategoria() {
  const categoriaId = document.getElementById('pop-up-categoria').getAttribute('data-editando');
  const categoria = categoriasData.find(c => c.id === categoriaId);
  
  if (!categoria) return;

  // Obtener valores del pop-up
  const habilitada = document.getElementById('popup-categoria-toggle').checked;

  // Validaciones básicas
  if (categoria.habilitada === habilitada) {
    alert('No se han realizado cambios en la categoría');
    return;
  }

  try {
    // Obtener token de autenticación
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      alert('No hay token de autenticación');
      return;
    }

    // Llamar al endpoint del backend para actualizar el estado
    const response = await fetch(`/api/categorias/${categoriaId}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ habilitada })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al actualizar el estado de la categoría');
    }

    console.log('✅ Respuesta del backend:', result);

    // Actualizar el array local
    categoria.habilitada = habilitada;

    // Recargar las categorías para reflejar los cambios
    await cargarCategorias();

    // Cerrar el pop-up
    cerrarPopUpCategoria();

    // Mostrar notificación de éxito
    mostrarNotificacion('Categoría actualizada correctamente', 'success');

  } catch (error) {
    console.error('❌ Error al guardar cambios:', error);
    alert('Error al guardar los cambios');
  }
}

// Función para cerrar el pop-up
function cerrarPopUpCategoria() {
  document.getElementById('pop-up-categoria').style.display = 'none';
  document.getElementById('pop-up-categoria').removeAttribute('data-editando');
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  console.log(`${tipo.toUpperCase()}: ${mensaje}`);
}

// Función para inicializar eventos
function inicializarEventos() {
  // Evento para cerrar pop-up al hacer click fuera
  const popUp = document.getElementById('pop-up-categoria');
  if (popUp) {
    popUp.addEventListener('click', (e) => {
      if (e.target === popUp) {
        cerrarPopUpCategoria();
      }
    });
  }

  // Evento para botón de guardar
  const btnGuardar = document.getElementById('confirmar-categoria');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarCambiosCategoria);
  }

  // Evento para botón de cancelar
  const btnCancelar = document.getElementById('cancelar-categoria');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', cerrarPopUpCategoria);
  }

  // Evento para el toggle de habilitación
  const toggle = document.getElementById('popup-categoria-toggle');
  if (toggle) {
    toggle.addEventListener('change', function() {
      const toggleText = document.getElementById('popup-categoria-toggle-text');
      toggleText.textContent = this.checked ? 'Categoría habilitada' : 'Categoría deshabilitada';
    });
  }

  console.log('✅ Eventos del componente de categorías inicializados');
}

// Función para inicializar categorías de una empresa
async function inicializarCategoriasEmpresa(empresaId, categorias) {
  try {
    console.log('🔄 Inicializando categorías para empresa:', empresaId);
    
    // Crear registros para todas las categorías como habilitadas por defecto
    const registrosIniciales = categorias.map(categoria => ({
      empresa_id: empresaId,
      categoria_id: categoria.id,
      habilitada: true,
      prioridad: 1
    }));

    // Insertar todos los registros en empresa_categorias
    const { error: insertError } = await supabase
      .from('empresa_categorias')
      .insert(registrosIniciales);

    if (insertError) {
      console.error('❌ Error al inicializar categorías de empresa:', insertError);
      throw insertError;
    }

    console.log(`✅ ${categorias.length} categorías inicializadas para la empresa`);
    
  } catch (error) {
    console.error('❌ Error al inicializar categorías de empresa:', error);
    // No lanzar error para no interrumpir la carga de categorías
  }
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

// Función para configurar tooltips de las categorías
function configurarTooltipsCategorias() {
  document.querySelectorAll('.categoria-info-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.stopPropagation(); // Evitar que se abra el modal de edición
      
      // Cierra otros tooltips
      document.querySelectorAll('.categoria-card').forEach(card => card.classList.remove('show-tooltip'));
      
      // Abre el de esta card
      const card = this.closest('.categoria-card');
      card.classList.add('show-tooltip');
      
      // Si no existe el tooltip, lo crea
      if (!card.querySelector('.info-tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.className = 'info-tooltip';
        tooltip.textContent = this.dataset.info;
        card.appendChild(tooltip);
      }
    });
  });

  // Cierra el tooltip al hacer click fuera
  document.addEventListener('click', () => {
    document.querySelectorAll('.categoria-card').forEach(card => card.classList.remove('show-tooltip'));
  });
}
