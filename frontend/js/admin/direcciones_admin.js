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
          <td>${d.codigo_postal ?? "-"}</td>
          <td>
            <span class="badge ${d.is_active ? 'badge-success' : 'badge-danger'}">
              ${d.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </td>
          <td>
            <button class="btn btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 256 256">
                <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z"></path>
              </svg>
              Editar
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