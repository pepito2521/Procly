document.addEventListener("seccion-cambiada", (e) => {
    if (e.detail === "usuarios") {
      cargarUsuariosTemplate();
    }
  });

async function cargarUsuariosTemplate() {
    let tbody;
    let listado = { usuarios: [] }; // Inicializamos listado para evitar errores de referencia

    try {
        const token = localStorage.getItem('supabaseToken');
        if (!token) {
            console.error("Token no disponible.");
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. KPIs y listado
        const [
            kpiTotal,
            kpiActivos,
            kpiBloqueados,
            listadoGasto,
            kpiPorcentaje,
            nuevos,
            kpiPorcentajeBloqueados
        ] = await Promise.all([
            fetch('/stats/usuarios-totales', { headers }).then(r => r.json()),
            fetch('/stats/usuarios-activos', { headers }).then(r => r.json()),
            fetch('/stats/usuarios-bloqueados', { headers }).then(r => r.json()),
            fetch('/stats/usuarios-gasto-total', { headers }).then(r => r.json()),
            fetch('/stats/usuarios-activos-porcentaje', { headers }).then(r => r.json()),
            fetch('/stats/usuarios-nuevos-mes', { headers }).then(r => r.json()),
            fetch('/stats/usuarios-bloqueados-porcentaje', { headers }).then(r => r.json())
        ]);

        // Asignamos listado correctamente
        listado = listadoGasto || { usuarios: [] };

        // Logs para depuración
        console.log({kpiTotal, kpiActivos, kpiBloqueados, listado, kpiPorcentaje, nuevos, kpiPorcentajeBloqueados});

        document.getElementById("totalUsuarios").textContent = kpiTotal.total ?? 0;
        document.getElementById("usuariosActivos").textContent = kpiActivos.total ?? 0;
        document.getElementById("usuariosBloqueados").textContent = kpiBloqueados.total ?? 0;
        document.getElementById("porcentajeUsuariosActivos").textContent = `${kpiPorcentaje.porcentaje}% del total`;
        document.getElementById("usuariosNuevosMes").textContent =
            nuevos.nuevos === 0
                ? "Ningún usuario nuevo este mes"
                : `${nuevos.nuevos} nuevo${nuevos.nuevos > 1 ? 's' : ''} este mes`;
        document.getElementById("porcentajeUsuariosBloqueados").textContent = `${kpiPorcentajeBloqueados.porcentaje}% del total`;

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
                        <button class="btn-cancelar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#0f2e2e" viewBox="0 0 256 256">
                                <path d="M200,168a48.05,48.05,0,0,1-48,48H136v16a8,8,0,0,1-16,0V216H104a48.05,48.05,0,0,1-48-48,8,8,0,0,1,16,0,32,32,0,0,0,32,32h48a32,32,0,0,0,0-64H112a48,48,0,0,1,0-96h8V24a8,8,0,0,1,16,0V40h8a48.05,48.05,0,0,1,48,48,8,8,0,0,1-16,0,32,32,0,0,0-32-32H112a32,32,0,0,0,0,64h40A48.05,48.05,0,0,1,200,168Z"></path>
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
        const tbodyError = document.getElementById("tablaUsuarios");
        if (tbodyError) {
            tbodyError.innerHTML = `<tr><td colspan="6">❌ Error al cargar usuarios</td></tr>`;
        }
        return;
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

    window.listadoUsuarios = listado.usuarios;

    tbody.querySelectorAll('.btn-cancelar').forEach((btn, i) => {
        btn.addEventListener('click', function() {
            const idUsuario = window.listadoUsuarios[i].profile_id;
            cargarPopupLimite(idUsuario);
        });
    });

    tbody.querySelectorAll('.btn-eliminar').forEach((btn, i) => {
        btn.addEventListener('click', function() {
            const idUsuario = window.listadoUsuarios[i].profile_id;
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