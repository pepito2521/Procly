document.addEventListener("seccion-cambiada", (e) => {
    if (e.detail === "direcciones") {
      cargarDireccionesTemplate();
    }
  });

async function cargarDireccionesTemplate() {
    let tbody;
    try {
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        console.error("Usuario no autenticado (token faltante).");
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
  
      const [kpi, lista, activas, bloqueadas] = await Promise.all([
        fetch(`/stats/direcciones-totales`, { headers }).then(r => r.json()),
        fetch(`/stats/direcciones`, { headers }).then(r => r.json()),
        fetch(`/stats/direcciones-activas`, { headers }).then(r => r.json()),
        fetch(`/stats/direcciones-bloqueadas`, { headers }).then(r => r.json())
      ]);
          
      
      document.getElementById("totalDirecciones").textContent = kpi.total ?? 0;
      document.getElementById("DireccionesActivas").textContent = activas.total ?? 0;
      document.getElementById("DireccionesBloqueadas").textContent = bloqueadas.total ?? 0;
  
      tbody = document.getElementById("tablaDirecciones");
      tbody.innerHTML = "";
  
      if (lista.direcciones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">⚠️ No hay direcciones disponibles</td></tr>`;
        return;
      }
  
      lista.direcciones.forEach(d => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${d.nombre}</td>
            <td>${d.direccion}</td>
            <td>${d.ciudad ?? ""}, ${d.provincia ?? ""}</td>
            <td>
            <span class="badge ${d.is_active ? 'badge-success' : 'badge-danger'}">
                ${d.is_active ? 'Activa' : 'Inactiva'}
            </span>
            </td>
            <td>
                <div class="acciones-btns" style="display: flex; gap: 8px;">
                    <button class="btn-editar" data-id="${d.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1976d2" viewBox="0 0 256 256">
                            <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z"></path>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-eliminar" data-id="${d.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#d32f2f" viewBox="0 0 256 256">
                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </td>
  
        `;
        tbody.appendChild(row);
      });

      const btnAgregar = document.getElementById('btnAgregarDireccion');
      if (btnAgregar) {
        btnAgregar.addEventListener('click', cargarPopupDireccion);
      }

      tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          cargarPopupEliminar(id);
        });
      });

      tbody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          cargarPopupEditar(id);
        });
      });

    } catch (error) {
      console.error("Error cargando direcciones:", error);
      document.getElementById("tablaDirecciones").innerHTML = `<tr><td colspan="6">❌ Error al cargar direcciones</td></tr>`;
    }
  
    const inputBuscador = document.getElementById("buscadorDirecciones");
  
    inputBuscador?.addEventListener("input", (e) => {

      const valor = e.target.value.toLowerCase();
  
      const filas = tbody.querySelectorAll("tr");
      filas.forEach((fila) => {
        const textoFila = fila.textContent.toLowerCase();
        const coincide = textoFila.includes(valor);
        fila.style.display = coincide ? "" : "none";
      });
    });
  }

// FUNCION: POP-UP ELIMINAR
async function cargarPopupEliminar(idDireccion) {
  const response = await fetch('/components/pop-up-eliminar.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';

  document.getElementById('cancelar-eliminar').onclick = function() {
    document.getElementById('popup-direccion-container').style.display = 'none';
  };

  document.getElementById('confirmar-eliminar').onclick = function() {
    eliminarDireccion(idDireccion);
    document.getElementById('popup-direccion-container').style.display = 'none';
  };

  const popup = document.getElementById('pop-up-eliminar');
  if (popup) {
    popup.addEventListener('click', function(event) {
      if (event.target === popup) {
        document.getElementById('popup-direccion-container').style.display = 'none';
      }
    });
  }
}

async function cargarPopupDireccion() {
  const response = await fetch('/components/pop-up-direccion.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';

  // Botón para cerrar con la X
  document.getElementById('cerrar-pop-up-direccion').onclick = function() {
    document.getElementById('popup-direccion-container').style.display = 'none';
  };

  // Botón para cerrar con "Cancelar"
  document.querySelector('.btn-cancelar').onclick = function() {
    document.getElementById('popup-direccion-container').style.display = 'none';
  };

  // Cerrar haciendo click fuera del contenido
  const popup = document.getElementById('pop-up-direccion');
  if (popup) {
    popup.addEventListener('click', function(event) {
      if (event.target === popup) {
        document.getElementById('popup-direccion-container').style.display = 'none';
      }
    });
  }
}

async function cargarPopupEditar(idDireccion) {
  const response = await fetch('/components/pop-up-editar.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';

  // Botón para cerrar con la X
  document.getElementById('cerrar-pop-up-editar').onclick = function() {
    document.getElementById('popup-direccion-container').style.display = 'none';
  };

  // Botón para cerrar con "Cancelar"
  document.querySelector('.btn-cancelar').onclick = function() {
    document.getElementById('popup-direccion-container').style.display = 'none';
  };

  // Cerrar haciendo click fuera del contenido
  const popup = document.getElementById('pop-up-editar');
  if (popup) {
    popup.addEventListener('click', function(event) {
      if (event.target === popup) {
        document.getElementById('popup-direccion-container').style.display = 'none';
      }
    });
  }

  // --- Precargar datos ---
  // 1. Buscar la dirección en la lista global (puedes guardar la lista en window o en una variable global)
  const direccion = window.listaDirecciones?.find(d => d.id == idDireccion);
  if (direccion) {
    document.getElementById('editar-nombre').value = direccion.nombre || '';
    document.getElementById('editar-direccion').value = direccion.direccion || '';
    document.getElementById('editar-ciudad').value = direccion.ciudad || '';
    document.getElementById('editar-provincia').value = direccion.provincia || '';
    document.getElementById('editar-codigo_postal').value = direccion.codigo_postal || '';
    document.getElementById('editar-pais').value = direccion.pais || '';
  }
}