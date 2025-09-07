// CATEGORÍAS ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initCategorias() {
  console.log('🔧 Inicializando componente de categorías...');
  
  // Verificar que el pop-up esté disponible antes de continuar
  if (!document.getElementById('pop-up-categoria')) {
    console.log('⏳ Pop-up de categoría no disponible, esperando...');
    // Esperar un poco y reintentar
    setTimeout(() => {
      if (document.getElementById('pop-up-categoria')) {
        console.log('✅ Pop-up de categoría encontrado, continuando...');
        cargarCategorias();
        inicializarEventos();
      } else {
        console.error('❌ Pop-up de categoría no disponible después de esperar');
      }
    }, 500);
    return;
  }
  
  console.log('✅ Pop-up de categoría disponible, continuando...');
  cargarCategorias();
  inicializarEventos();
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

      console.log('🔍 Debug perfil usuario:', {
        userId: user.id,
        perfil: perfil,
        empresaId: perfil?.empresa_id,
        empresaIdType: typeof perfil?.empresa_id,
        perfilError: perfilError
      });

      if (perfilError || !perfil?.empresa_id) {
        console.error('❌ Error al obtener empresa_id del usuario:', perfilError);
        // Si no se puede obtener empresa_id, usar todas las categorías como habilitadas por defecto
        categorias.forEach(categoria => {
          categoria.habilitada = true;
        });
      } else {
        console.log('🔍 Consultando empresa_categorias con empresa_id:', perfil.empresa_id);
        
        // Usar directamente el empresa_id del perfil (ya es TEXT)
        if (perfil.empresa_id) {
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
            // Si no hay registros en empresa_categorias, usar todas como habilitadas por defecto
            if (!empresaCategorias || empresaCategorias.length === 0) {
              console.log('🔄 No hay categorías configuradas para la empresa, usando todas como habilitadas por defecto');
              // No inicializar automáticamente, solo usar todas como habilitadas
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

  console.log('🎯 Abriendo pop-up para categoría:', categoria);

  // Verificar que el pop-up existe en el DOM
  const popUp = document.getElementById('pop-up-categoria');
  if (!popUp) {
    console.error('❌ No se encontró el pop-up de categoría en el DOM');
    return;
  }

  // Actualizar el título con solo el nombre de la categoría (sin "Gestionar:")
  const titulo = document.getElementById('popup-categoria-titulo');
  const descripcion = document.getElementById('popup-categoria-descripcion');
  
  if (titulo) titulo.textContent = categoria.nombre;
  if (descripcion) descripcion.textContent = `Configura el estado de la categoría "${categoria.nombre}"`;
  
  // Actualizar el icono de la categoría
  const iconContainer = document.getElementById('popup-categoria-icon');
  console.log('🔍 Debug icono pop-up:', {
    iconContainer: iconContainer,
    categoriaIcon: categoria.icon,
    categoriaNombre: categoria.nombre
  });
  
  if (!iconContainer) {
    console.error('❌ No se encontró el contenedor del icono: popup-categoria-icon');
    console.log('📋 Elementos disponibles en el DOM:', 
      Array.from(document.querySelectorAll('[id*="popup-categoria"]')).map(el => el.id)
    );
  } else {
    let iconoHTML = '';
    
    if (categoria.icon && categoria.icon.includes('/storage/')) {
      // Es un icono de Supabase Storage
      const correctedIconPath = categoria.icon.replace('/images/', '/icon/');
      const supabaseUrl = supabase.supabaseUrl;
      const fullIconUrl = `${supabaseUrl}${correctedIconPath}`;
      
      iconoHTML = `<img src="${fullIconUrl}" alt="Icono ${categoria.nombre}" width="24" height="24">`;
      console.log('🖼️ Icono desde Supabase Storage:', fullIconUrl);
    } else if (categoria.icon && categoria.icon.startsWith('http')) {
      // Es una URL completa
      iconoHTML = `<img src="${categoria.icon}" alt="Icono ${categoria.nombre}" width="24" height="24">`;
      console.log('🌐 Icono desde URL externa:', categoria.icon);
    } else {
      // Fallback al SVG genérico
      iconoHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
      </svg>`;
      console.log('⚡ Usando icono SVG genérico (fallback)');
    }
    
    iconContainer.innerHTML = iconoHTML;
    console.log('🎨 Icono actualizado para:', categoria.nombre, 'HTML:', iconoHTML);
  }
  
  // Configurar el toggle
  const toggle = document.getElementById('popup-categoria-toggle');
  const toggleText = document.getElementById('popup-categoria-toggle-text');
  
  toggle.checked = categoria.habilitada;
  toggleText.textContent = categoria.habilitada ? 'Categoría habilitada' : 'Categoría deshabilitada';
  
  // Guardar el ID de la categoría que se está editando
  document.getElementById('pop-up-categoria').setAttribute('data-editando', categoria.id);
  
  // Mostrar el pop-up
  const popUpElement = document.getElementById('pop-up-categoria');
  popUpElement.style.display = 'flex';
  popUpElement.classList.add('active');
  
  console.log('✅ Pop-up mostrado con display: flex y clase active');
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
  const popUpElement = document.getElementById('pop-up-categoria');
  popUpElement.style.display = 'none';
  popUpElement.classList.remove('active');
  popUpElement.removeAttribute('data-editando');
  
  console.log('✅ Pop-up cerrado y clase active removida');
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
      console.warn('⚠️ No se pudo inicializar categorías de empresa (RLS):', insertError.message);
      console.log('ℹ️ Las categorías se mostrarán como habilitadas por defecto');
      return false; // Retornar false para indicar que no se pudo inicializar
    }

    console.log(`✅ ${categorias.length} categorías inicializadas para la empresa`);
    return true;
    
  } catch (error) {
    console.warn('⚠️ Error al inicializar categorías de empresa:', error.message);
    console.log('ℹ️ Las categorías se mostrarán como habilitadas por defecto');
    return false; // No lanzar error para no interrumpir la carga de categorías
  }
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
