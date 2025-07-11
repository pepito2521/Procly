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
                    <button class="btn-sm btn-editar" data-id="${d.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1976d2" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-51.32-51.32a16,16,0,0,0-22.63,0l-96,96A16,16,0,0,0,56,134.06V184a16,16,0,0,0,16,16h49.94a16,16,0,0,0,11.31-4.69l96-96A16,16,0,0,0,229.66,77.66ZM128,192H72V136l96-96,56,56Z"></path>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-sm btn-eliminar" data-id="${d.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#d32f2f" viewBox="0 0 256 256">
                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40A8,8,0,0,0,40,64H56V208a24,24,0,0,0,24,24H176a24,24,0,0,0,24-24V64h16a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V64H192Z"></path>
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