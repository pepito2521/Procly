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

    // Función helper para manejar fetch con mejor manejo de errores
    async function fetchWithErrorHandling(url, headers) {
      try {
        const response = await fetch(url, { headers });
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
    tbody.innerHTML = `<tr><td colspan="5">⚠️ No hay direcciones disponibles</td></tr>`;
    return;
  }

  direcciones.forEach(direccion => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${direccion.nombre || 'Sin nombre'}</td>
      <td>${direccion.direccion || 'Sin dirección'}</td>
      <td>${direccion.ciudad || ''}${direccion.provincia ? `, ${direccion.provincia}` : ''}</td>
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
            ${direccion.is_active 
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path></svg> Bloquear`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H96V56a32,32,0,0,1,32-32c15.37,0,29.2,11,32.16,25.59a8,8,0,0,0,15.68-3.18C171.32,24.15,151.2,8,128,8A48.05,48.05,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,128H48V96H208V208Z"></path></svg> Activar`
            }
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

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
      cargarPopupBloquearDireccion(idDireccion);
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
    
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
      return;
    }

    // Obtener los datos de la dirección desde la tabla
    const fila = document.querySelector(`[data-id="${idDireccion}"]`);
    if (!fila) {
      console.error('❌ No se encontró la fila de la dirección');
      return;
    }

    // Extraer los datos de la fila de la tabla
    const nombre = fila.children[0]?.textContent?.trim() || '';
    const direccion = fila.children[1]?.textContent?.trim() || '';
    const ciudadProvincia = fila.children[2]?.textContent?.trim() || '';
    const estado = fila.children[3]?.textContent?.trim() || '';
    
    // Separar ciudad y provincia si están juntas
    let ciudad = '';
    let provincia = '';
    if (ciudadProvincia.includes(',')) {
      [ciudad, provincia] = ciudadProvincia.split(',').map(s => s.trim());
    } else {
      ciudad = ciudadProvincia;
    }

    console.log('📋 Datos extraídos:', { nombre, direccion, ciudad, provincia, estado });

    // Auto-completar los campos del formulario
    const inputNombre = document.getElementById('editar-nombre');
    const inputDireccion = document.getElementById('editar-direccion');
    const inputCiudad = document.getElementById('editar-ciudad');
    const inputProvincia = document.getElementById('editar-provincia');
    const inputCodigoPostal = document.getElementById('editar-codigo_postal');
    const inputPais = document.getElementById('editar-pais');
    const checkboxActiva = document.getElementById('editar-activa');

    if (inputNombre) inputNombre.value = nombre;
    if (inputDireccion) inputDireccion.value = direccion;
    if (inputCiudad) inputCiudad.value = ciudad;
    if (inputProvincia) inputProvincia.value = provincia;
    if (inputCodigoPostal) inputCodigoPostal.value = ''; // No tenemos este dato en la tabla
    if (inputPais) inputPais.value = 'Argentina'; // Valor por defecto
    if (checkboxActiva) checkboxActiva.checked = estado === 'Activa';

    console.log('✅ Campos auto-completados correctamente');

  } catch (error) {
    console.error('❌ Error al cargar datos de dirección:', error);
    alert('Error al cargar los datos de la dirección');
  }
}