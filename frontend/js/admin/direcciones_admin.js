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
                <button class="btn-sm btn-editar" data-id="${d.id}">
                <svg><!-- ícono editar --></svg>
                Editar
                </button>
                <button class="btn-sm btn-eliminar" data-id="${d.id}" style="margin-left:8px;">
                <svg><!-- ícono eliminar --></svg>
                Eliminar
                </button>
            </td>
  
        `;
        tbody.appendChild(row);
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

document.querySelectorAll('.btn-eliminar').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    cargarPopupEliminar(id);
  });
});

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