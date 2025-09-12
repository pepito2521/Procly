// DIRECCIONES ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initDirecciones() {
  cargarDireccionesTemplate();
}

async function cargarDireccionesTemplate() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

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
        
        const response = await fetch(urlWithCacheBusting, { headers: headersWithCache });
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

    // Cargar tabla de direcciones
    const listadoDirecciones = await fetchWithErrorHandling('/stats/direcciones', headers);
    cargarTablaDirecciones(listadoDirecciones?.direcciones || []);

    // Configurar botón agregar dirección
    const btnAgregar = document.getElementById("btnAgregarDireccion");
    if (btnAgregar) {
      btnAgregar.addEventListener("click", () => {
        cargarPopupAgregarDireccion();
      });
    }

  } catch (error) {
    console.error("Error al cargar direcciones:", error);
  }
}

function cargarTablaDirecciones(direcciones) {
  const tbody = document.getElementById("tablaDirecciones");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!direcciones || direcciones.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#d1d5db" viewBox="0 0 256 256">
              <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88,88,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,210,200.25c27.45-31.57,42-64.85,42-96.25A88,88,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.25,144.53,209,128,222Z"></path>
            </svg>
            <div>
              <h3 style="margin: 0; color: #374151;">No hay direcciones registradas</h3>
              <p style="margin: 0.5rem 0 0 0;">Comienza agregando tu primera dirección de entrega</p>
            </div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  direcciones.forEach(direccion => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${direccion.nombre || 'Sin nombre'}</td>
      <td>${direccion.direccion || 'Sin dirección'}</td>
      <td>${direccion.ciudad || 'Sin ciudad'}</td>
      <td>
        <span class="estado-badge ${direccion.is_active ? 'activa' : 'bloqueada'}">
          ${direccion.is_active ? 'Activa' : 'Bloqueada'}
        </span>
      </td>
      <td>
        <div class="acciones-btns">
          <button class="btn-gris" data-id="${direccion.direccion_id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152.05A16,16,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A16,16,0,0,0,103.95,219.31L227.31,95.95a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z"></path>
            </svg>
            Editar
          </button>
          <button class="btn-rojo" data-id="${direccion.direccion_id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
            </svg>
            Eliminar
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  window.listadoDirecciones = direcciones;

  // Configurar buscador
  const inputBuscador = document.getElementById("buscadorDirecciones");
  if (inputBuscador) {
    inputBuscador.addEventListener("input", (e) => {
      const valor = e.target.value.toLowerCase();
      const filas = tbody.querySelectorAll("tr");
      filas.forEach((fila) => {
        const textoNombre = fila.children[0]?.textContent.toLowerCase() ?? "";
        const textoDireccion = fila.children[1]?.textContent.toLowerCase() ?? "";
        const textoCiudad = fila.children[2]?.textContent.toLowerCase() ?? "";
        
        const coincide = textoNombre.includes(valor) || 
                        textoDireccion.includes(valor) || 
                        textoCiudad.includes(valor);
        
        fila.style.display = coincide ? "" : "none";
      });
    });
  }

  // Configurar botones de acción
  tbody.querySelectorAll('.btn-gris').forEach(btn => {
    btn.addEventListener('click', function() {
      const idDireccion = this.getAttribute('data-id');
      cargarPopupEditarDireccion(idDireccion);
    });
  });

  tbody.querySelectorAll('.btn-rojo').forEach(btn => {
    btn.addEventListener('click', function() {
      const idDireccion = this.getAttribute('data-id');
      cargarPopupEliminarDireccion(idDireccion);
    });
  });
}

// Mostrar pop-up de agregar dirección
async function cargarPopupAgregarDireccion() {
  const response = await fetch('/components/pop-up-nueva-direccion.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  document.getElementById('pop-up-direccion').style.display = 'flex';

  // Configurar formulario y botones
  configurarPopupDireccion();

  // Agregar event listener para el submit del formulario
  const form = document.getElementById('form-pop-up-direccion');
  if (form) {
    form.onsubmit = async function(e) {
      e.preventDefault();
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      const data = {
        nombre: form.nombre.value.trim(),
        direccion: form.direccion.value.trim(),
        ciudad: form.ciudad.value.trim(),
        provincia: form.provincia.value.trim(),
        codigo_postal: form.codigo_postal.value.trim(),
        pais: form.pais.value.trim()
      };
      try {
        const resp = await fetch('/stats/direcciones', {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error('No se pudo agregar la dirección');
        document.getElementById('popup-direccion-container').style.display = 'none';
        await cargarDireccionesTemplate();
      } catch (error) {
        alert('Error al agregar la dirección: ' + error.message);
      }
    };
  }
}

// Mostrar pop-up de editar dirección
async function cargarPopupEditarDireccion(idDireccion) {
  const response = await fetch('/components/pop-up-editar-direccion.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  document.getElementById('pop-up-editar').style.display = 'flex';

  // Configurar formulario y botones
  configurarPopupEditarDireccion(idDireccion);
}

// Mostrar pop-up de bloquear dirección
async function cargarPopupBloquearDireccion(idDireccion) {
  const response = await fetch('/components/pop-up-bloquear-direccion.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  document.getElementById('pop-up-bloquear').style.display = 'flex';

  // Configurar botones
  configurarPopupBloquear();
}

function configurarPopupDireccion() {
  const popup = document.getElementById('pop-up-direccion');
  if (!popup) return;

  const btnCancelar = popup.querySelector('.btn-gris');
  if (btnCancelar) {
    btnCancelar.onclick = function() {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    };
  }

  // Cerrar haciendo click fuera
  popup.addEventListener('click', function(event) {
    if (event.target === popup) {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    }
  });
}

function configurarPopupEditarDireccion(idDireccion) {
  const popup = document.getElementById('pop-up-editar');
  if (!popup) return;

  // Botón cancelar
  const btnCancelar = popup.querySelector('.btn-gris');
  if (btnCancelar) {
    btnCancelar.onclick = function() {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    };
  }

  popup.addEventListener('click', function(event) {
    if (event.target === popup) {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    }
  });
  cargarDatosDireccion(idDireccion);

  // --- NUEVO: submit edición ---
  const form = document.getElementById('form-pop-up-editar');
  if (form) {
    form.onsubmit = async function(e) {
      e.preventDefault();
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      const data = {
        nombre: form.nombre.value.trim(),
        direccion: form.direccion.value.trim(),
        ciudad: form.ciudad.value.trim(),
        provincia: form.provincia.value.trim(),
        codigo_postal: form.codigo_postal.value.trim(),
        pais: form.pais.value.trim(),
        is_active: form.is_active.checked
      };
      // Mostrar spinner
      const spinner = document.querySelector('.glass-loader');
      if (spinner) spinner.style.display = 'flex';
      try {
        const resp = await fetch(`/stats/direcciones/${idDireccion}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error('No se pudo editar la dirección');
        popup.style.display = 'none';
        document.getElementById('popup-direccion-container').style.display = 'none';
        // Recargar datos para reflejar cambios
        await recargarDatosDirecciones();
      } catch (error) {
        alert('Error al editar la dirección: ' + error.message);
      } finally {
        if (spinner) spinner.style.display = 'none';
      }
    };
  }
}

function configurarPopupBloquear() {
  const popup = document.getElementById('pop-up-bloquear');
  if (!popup) return;

  const btnCancelar = popup.querySelector('.btn-gris');
  if (btnCancelar) {
    btnCancelar.onclick = function() {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    };
  }

  // Cerrar haciendo click fuera
  popup.addEventListener('click', function(event) {
    if (event.target === popup) {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    }
  });
}

// Función para cargar y auto-completar los datos de una dirección
async function cargarDatosDireccion(idDireccion) {
  try {
    console.log('🔄 Cargando datos de dirección:', idDireccion);
    // Buscar la dirección completa en el array global
    const direccionObj = (window.listadoDirecciones || []).find(d => d.direccion_id == idDireccion);
    if (!direccionObj) {
      alert('No se encontró la dirección en la lista.');
      return;
    }
    // Auto-completar los campos del formulario
    const inputNombre = document.getElementById('editar-nombre');
    const inputDireccion = document.getElementById('editar-direccion');
    const inputCiudad = document.getElementById('editar-ciudad');
    const inputProvincia = document.getElementById('editar-provincia');
    const inputCodigoPostal = document.getElementById('editar-codigo_postal');
    const inputPais = document.getElementById('editar-pais');
    const checkboxActiva = document.getElementById('editar-activa');
    if (inputNombre) inputNombre.value = direccionObj.nombre || '';
    if (inputDireccion) inputDireccion.value = direccionObj.direccion || '';
    if (inputCiudad) inputCiudad.value = direccionObj.ciudad || '';
    if (inputProvincia) inputProvincia.value = direccionObj.provincia || '';
    if (inputCodigoPostal) inputCodigoPostal.value = direccionObj.codigo_postal || '';
    if (inputPais) inputPais.value = direccionObj.pais || '';
    if (checkboxActiva) checkboxActiva.checked = !!direccionObj.is_active;
    console.log('✅ Campos auto-completados correctamente');
  } catch (error) {
    console.error('❌ Error al cargar datos de dirección:', error);
    alert('Error al cargar los datos de la dirección');
  }
}

// --- 3. Nueva función para cargar el pop-up de eliminar dirección ---
async function cargarPopupEliminarDireccion(idDireccion) {
  const response = await fetch('/components/pop-up-eliminar-direccion.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  const popup = document.getElementById('pop-up-eliminar');
  popup.style.display = 'flex';

  // Cerrar al hacer click fuera del contenido
  popup.addEventListener('click', function(event) {
    if (event.target === popup) {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    }
  });

  // Botón cancelar
  const btnCancelar = document.getElementById('cancelar-eliminar');
  if (btnCancelar) {
    btnCancelar.onclick = function() {
      popup.style.display = 'none';
      document.getElementById('popup-direccion-container').style.display = 'none';
    };
  }

  // Botón eliminar
  const btnEliminar = document.getElementById('confirmar-eliminar');
  if (btnEliminar) {
    btnEliminar.onclick = async function() {
      try {
        const token = localStorage.getItem('supabaseToken');
        if (!token) {
          alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
          return;
        }
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const resp = await fetch(`/stats/direcciones/${idDireccion}`, {
          method: 'DELETE',
          headers
        });
        if (!resp.ok) throw new Error('No se pudo eliminar la dirección');
        // Cerrar pop-up
        popup.style.display = 'none';
        document.getElementById('popup-direccion-container').style.display = 'none';
        // Recargar datos para reflejar cambios
        await recargarDatosDirecciones();
      } catch (error) {
        alert('Error al eliminar la dirección: ' + error.message);
      }
    };
  }
}

// Función para recargar datos después de cambios
async function recargarDatosDirecciones() {
  try {
    // Mostrar spinner
    const spinner = document.querySelector('.glass-loader');
    if (spinner) spinner.style.display = 'flex';
    
    // Recargar la tabla completa
    await cargarDireccionesTemplate();
    
    // Ocultar spinner
    if (spinner) spinner.style.display = 'none';
    
    console.log('✅ Datos de direcciones recargados correctamente');
  } catch (error) {
    console.error('❌ Error al recargar datos de direcciones:', error);
    // Ocultar spinner en caso de error
    const spinner = document.querySelector('.glass-loader');
    if (spinner) spinner.style.display = 'none';
  }
}