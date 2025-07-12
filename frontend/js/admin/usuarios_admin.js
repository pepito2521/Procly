document.addEventListener("seccion-cambiada", (e) => {
    if (e.detail === "usuarios") {
      cargarUsuariosTemplate();
    }
  });

async function cargarUsuariosTemplate() {
    let tbody;
    try {
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        console.error("Token no disponible.");
        return;
      }
  
      const headers = { 'Authorization': `Bearer ${token}` };
  
      // 1. KPIs
      const [kpiTotal, kpiActivos, kpiGasto, listado, kpiPorcentaje, nuevos] = await Promise.all([
        fetch('/stats/usuarios-totales', { headers }).then(r => r.json()),
        fetch('/stats/usuarios-activos', { headers }).then(r => r.json()),
        fetch('/stats/gasto-promedio-mensual', { headers }).then(r => r.json()),
        fetch('/stats/usuarios-gasto-total', { headers }).then(r => r.json()),
        fetch('/stats/usuarios-activos-porcentaje', { headers }).then(r => r.json()),
        fetch('/stats/usuarios-nuevos-mes', { headers }).then(r => r.json())
      ]);
  
      document.getElementById("totalUsuarios").textContent = kpiTotal.total ?? 0;
      document.getElementById("usuariosActivos").textContent = kpiActivos.total ?? 0;
      document.getElementById("gastoPromedio").textContent = `$${kpiGasto.promedio?.toLocaleString() ?? 0}`;
      document.getElementById("porcentajeUsuariosActivos").textContent = `${kpiPorcentaje.porcentaje}% del total`;
      document.getElementById("usuariosNuevosMes").textContent =
        nuevos.nuevos === 0
            ? "Ningún usuario nuevo este mes"
            : `${nuevos.nuevos} nuevo${nuevos.nuevos > 1 ? 's' : ''} este mes`;
  
  
      // 2. Tabla
      tbody = document.getElementById("tablaUsuarios");
      tbody.innerHTML = "";
  
      if (!listado.usuarios || listado.usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">⚠️ No hay usuarios disponibles</td></tr>`;
        return;
      }
  
      listado.usuarios.forEach(u => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${u.nombre} ${u.apellido}</td>
          <td>$${u.gasto_total?.toLocaleString() ?? '0'}</td>
          <td>${u.limite_gasto ? `$${u.limite_gasto.toLocaleString()}` : '-'}</td>
          <td>
            <span class="badge ${!u.bloqueado ? 'badge-success' : 'badge-danger'}">
              ${!u.bloqueado ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <div class="acciones-btns">
              <button class="btn2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#0f2e2e" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a28,28,0,0,1-28,28h-4v8a8,8,0,0,1-16,0v-8H104a8,8,0,0,1,0-16h36a12,12,0,0,0,0-24H116a28,28,0,0,1,0-56h4V72a8,8,0,0,1,16,0v8h16a8,8,0,0,1,0,16H116a12,12,0,0,0,0,24h24A28,28,0,0,1,168,148Z"></path>
                </svg>
                Límite
              </button>
              <button class="btn-eliminar">
                ${u.bloqueado
                  ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#1976d2" viewBox="0 0 256 256"><path d="M208,80H96V56a32,32,0,0,1,32-32c15.37,0,29.2,11,32.16,25.59a8,8,0,0,0,15.68-3.18C171.32,24.15,151.2,8,128,8A48.05,48.05,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,128H48V96H208V208Z"></path></svg> Activar`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#d32f2f" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path></svg> Bloquear`
                }
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
  
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      document.getElementById("tablaUsuarios").innerHTML = `<tr><td colspan="6">❌ Error al cargar usuarios</td></tr>`;
    }

    // BUSCADOR DE USUARIOS
    const inputBuscador = document.getElementById("buscadorUsuarios");

    inputBuscador?.addEventListener("input", (e) => {
        const valor = e.target.value.toLowerCase();
        const filas = tbody.querySelectorAll("tr");
        filas.forEach((fila) => {
          const textoNombre = fila.children[0]?.textContent.toLowerCase() ?? "";
          fila.style.display = textoNombre.includes(valor) ? "" : "none";
        });
      });

    // Asigna los listeners en la tabla de usuarios
    tbody.querySelectorAll('.btn2').forEach((btn, i) => {
      btn.addEventListener('click', function() {
        const idUsuario = listado.usuarios[i].profile_id;
        cargarPopupLimite(idUsuario);
      });
    });
    tbody.querySelectorAll('.btn-eliminar').forEach((btn, i) => {
      btn.addEventListener('click', function() {
        const idUsuario = listado.usuarios[i].profile_id;
        cargarPopupBloquear(idUsuario);
      });
    });
  }

// Mostrar pop-up de límite
async function cargarPopupLimite(idUsuario) {
  const response = await fetch('/components/pop-up-limite.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  document.getElementById('pop-up-limite').style.display = 'flex';

  // Botón cancelar
  const popup = document.getElementById('pop-up-limite');
  const btnCancelar = popup.querySelector('.btn-cancelar');
  if (btnCancelar) {
    btnCancelar.onclick = function() {
      document.getElementById('popup-direccion-container').style.display = 'none';
    };
  }
  // Cerrar haciendo click fuera
  popup.addEventListener('click', function(event) {
    if (event.target === popup) {
      document.getElementById('popup-direccion-container').style.display = 'none';
    }
  });

  // Aquí puedes precargar el límite actual si lo necesitas
}

// Mostrar pop-up de bloquear
async function cargarPopupBloquear(idUsuario) {
  const response = await fetch('/components/pop-up-bloquear.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  document.getElementById('pop-up-bloquear').style.display = 'flex';

  // Botón cancelar
  const popup = document.getElementById('pop-up-bloquear');
  const btnCancelar = popup.querySelector('.btn-cancelar');
  if (btnCancelar) {
    btnCancelar.onclick = function() {
      document.getElementById('popup-direccion-container').style.display = 'none';
    };
  }
  // Cerrar haciendo click fuera
  popup.addEventListener('click', function(event) {
    if (event.target === popup) {
      document.getElementById('popup-direccion-container').style.display = 'none';
    }
  });

  // Aquí puedes agregar la lógica para confirmar el bloqueo
}