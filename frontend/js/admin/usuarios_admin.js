// USUARIOS ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initUsuarios() {
  cargarUsuariosTemplate();
}

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
            fetchWithErrorHandling('/stats/usuarios-totales', headers),
            fetchWithErrorHandling('/stats/usuarios-activos', headers),
            fetchWithErrorHandling('/stats/usuarios-bloqueados', headers),
            fetchWithErrorHandling('/stats/usuarios-gasto-total', headers),
            fetchWithErrorHandling('/stats/usuarios-activos-porcentaje', headers),
            fetchWithErrorHandling('/stats/usuarios-nuevos-mes', headers),
            fetchWithErrorHandling('/stats/usuarios-bloqueados-porcentaje', headers)
        ]);

        // Asignamos listado correctamente
        listado = listadoGasto || { usuarios: [] };

        // Logs para depuración
        console.log({kpiTotal, kpiActivos, kpiBloqueados, listado, kpiPorcentaje, nuevos, kpiPorcentajeBloqueados});

        document.getElementById("totalUsuarios").textContent = kpiTotal?.total ?? 0;
        document.getElementById("usuariosActivos").textContent = kpiActivos?.total ?? 0;
        document.getElementById("usuariosBloqueados").textContent = kpiBloqueados?.total ?? 0;
        document.getElementById("porcentajeUsuariosActivos").textContent = `${kpiPorcentaje?.porcentaje ?? 0}% del total`;
        document.getElementById("usuariosNuevosMes").textContent =
            (nuevos?.nuevos ?? 0) === 0
                ? "Ningún usuario nuevo este mes"
                : `${nuevos.nuevos} nuevo${nuevos.nuevos > 1 ? 's' : ''} este mes`;
        document.getElementById("porcentajeUsuariosBloqueados").textContent = `${kpiPorcentajeBloqueados?.porcentaje ?? 0}% del total`;

        // 2. Tabla
        tbody = document.getElementById("tablaUsuarios");
        tbody.innerHTML = "";

        if (!listado.usuarios || listado.usuarios.length === 0) {
            tbody.innerHTML = `
              <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#d1d5db" viewBox="0 0 256 256">
                      <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
                    </svg>
                    <div>
                      <h3 style="margin: 0; color: #374151;">No hay usuarios registrados</h3>
                      <p style="margin: 0.5rem 0 0 0;">Los usuarios aparecerán aquí cuando se registren</p>
                    </div>
                  </div>
                </td>
              </tr>
            `;
            return;
        }

        listado.usuarios.forEach(u => {
            const row = document.createElement("tr");
            row.setAttribute('data-id', u.profile_id);
            const gastoAcumulado = u.gasto_total !== null && u.gasto_total !== undefined ? `${Number(u.gasto_total).toLocaleString('es-AR').replace(/,/g, '.')} ARS` : '-';
            const limiteHtml = (u.limite_gasto && !isNaN(u.limite_gasto))
                ? `${Number(u.limite_gasto).toLocaleString('es-AR').replace(/,/g, '.')} ARS`
                : '<span class="sin-limite">Sin Límite</span>';
            const saldo = u.saldo !== null && u.saldo !== undefined ? `${Number(u.saldo).toLocaleString('es-AR').replace(/,/g, '.')} ARS` : '-';
            row.innerHTML = `
                <td>${u.nombre} ${u.apellido}</td>
                <td>${gastoAcumulado}</td>
                <td>${limiteHtml}</td>
                <td>${saldo}</td>
                <td>
                    <span class="estado-badge ${!u.bloqueado ? 'activa' : 'bloqueada'}">
                        ${!u.bloqueado ? 'Activo' : 'Bloqueado'}
                    </span>
                </td>
                <td>
                    <div class="acciones-btns">
                        <button class="btn-gris">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M200,168a48.05,48.05,0,0,1-48,48H136v16a8,8,0,0,1-16,0V216H104a48.05,48.05,0,0,1-48-48,8,8,0,0,1,16,0,32,32,0,0,0,32,32h48a32,32,0,0,0,0-64H112a48,48,0,0,1,0-96h8V24a8,8,0,0,1,16,0V40h8a48.05,48.05,0,0,1,48,48,8,8,0,0,1-16,0,32,32,0,0,0-32-32H112a32,32,0,0,0,0,64h40A48.05,48.05,0,0,1,200,168Z"></path>
                            </svg>
                            Límite
                        </button>
                        <button class="${u.bloqueado ? 'btn-verde' : 'btn-rojo'}">
                            ${u.bloqueado
                                ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H96V56a32,32,0,0,1,32-32c15.37,0,29.2,11,32.16,25.59a8,8,0,0,0,15.68-3.18C171.32,24.15,151.2,8,128,8A48.05,48.05,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,128H48V96H208V208Z"></path></svg> Activar`
                                : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path></svg> Bloquear`
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

    tbody.querySelectorAll('.btn-gris').forEach((btn, i) => {
        btn.addEventListener('click', function() {
            const idUsuario = window.listadoUsuarios[i].profile_id;
            cargarPopupLimite(idUsuario);
        });
    });

    tbody.querySelectorAll('.btn-rojo, .btn-verde').forEach((btn, i) => {
        btn.addEventListener('click', function() {
            const idUsuario = window.listadoUsuarios[i].profile_id;
            const estaBloqueado = !!window.listadoUsuarios[i].bloqueado;
            if (estaBloqueado) {
                cargarPopupActivar(idUsuario);
            } else {
                cargarPopupBloquear(idUsuario, estaBloqueado);
            }
        });
    });
}

// Mostrar pop-up de límite
async function cargarPopupLimite(idUsuario) {
  const response = await fetch('/components/pop-up-limite-usuario.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  document.getElementById('pop-up-limite').style.display = 'flex';

  // Botón cancelar
  const popup = document.getElementById('pop-up-limite');
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

  const form = document.getElementById('form-pop-up-limite');
  if (form) {
    form.onsubmit = async function(e) {
      e.preventDefault();
      const input = document.getElementById('input-limite');
      const valorSinSeparadores = input.value.replace(/\./g, '');
      const limite = Number(valorSinSeparadores);
      if (!limite || limite <= 0) {
        alert('Por favor, ingresa un límite válido mayor a 0');
        return;
      }
      
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
        return;
      }
      
      try {
        console.log('🔄 Enviando límite:', { profile_id: idUsuario, limite_gasto: limite });
        
        const resp = await fetch('https://www.procly.net/stats/limite-usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_id: idUsuario, limite_gasto: limite })
        });
        
        console.log('📡 Respuesta del servidor:', resp.status, resp.statusText);
        
        if (!resp.ok) {
          throw new Error(`Error del servidor: ${resp.status} ${resp.statusText}`);
        }
        
        const result = await resp.json();
        console.log('✅ Resultado:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Error desconocido');
        }
        
        popup.style.display = 'none';
        document.getElementById('popup-direccion-container').style.display = 'none';

        const spinner = document.querySelector('.glass-loader');
        if (spinner) spinner.style.display = 'flex';
        await actualizarDatosUsuario(idUsuario, limite);
        if (spinner) spinner.style.display = 'none';

      } catch (error) {
        console.error('❌ Error al actualizar límite:', error);
        alert('❌ Error al actualizar límite: ' + error.message);
      }
    };
  }

  // Formateo en tiempo real del input de límite
  const inputLimite = document.getElementById('input-limite');
  if (inputLimite) {
    inputLimite.addEventListener('input', function(e) {
      // Elimina todo lo que no sea número
      let valor = this.value.replace(/\D/g, '');
      // Formatea con separador de miles
      valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      this.value = valor;
    });
  }
}

// Función para actualizar solo los datos necesarios después de cambios
async function actualizarDatosUsuario(profileId, nuevoLimite = null, nuevoEstado = null) {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    // 1. Actualizar la fila específica en la tabla
    const filaUsuario = document.querySelector(`tr[data-id="${profileId}"]`);
    if (filaUsuario) {
      // Actualizar límite si se cambió
      if (nuevoLimite !== null) {
        const tdLimite = filaUsuario.querySelector('td:nth-child(3)');
        if (tdLimite) {
          tdLimite.innerHTML = nuevoLimite > 0 
            ? `${Number(nuevoLimite).toLocaleString('es-AR').replace(/,/g, '.')} ARS` 
            : '<span class="sin-limite">Sin Límite</span>';
        }
        
        // Actualizar saldo (columna 4) cuando cambia el límite
        await actualizarSaldoUsuario(profileId, filaUsuario);
      }

      // Actualizar estado si se cambió
      if (nuevoEstado !== null) {
        const tdEstado = filaUsuario.querySelector('td:nth-child(5)');
        if (tdEstado) {
          const nuevoBadge = nuevoEstado 
            ? '<span class="estado-badge activa">Activa</span>'
            : '<span class="estado-badge bloqueada">Bloqueada</span>';
          tdEstado.innerHTML = nuevoBadge;
        }
        
        // Actualizar botón de acción (columna 6)
        const tdAcciones = filaUsuario.querySelector('td:nth-child(6)');
        if (tdAcciones) {
          const btnAccion = tdAcciones.querySelector('.btn-rojo, .btn-verde');
          if (btnAccion) {
            // Usar la misma lógica que en cargarUsuariosTemplate
            btnAccion.className = nuevoEstado ? 'btn-rojo' : 'btn-verde';
            btnAccion.innerHTML = nuevoEstado
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path></svg> Bloquear`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H96V56a32,32,0,0,1,32-32c15.37,0,29.2,11,32.16,25.59a8,8,0,0,0,15.68-3.18C171.32,24.15,151.2,8,128,8A48.05,48.05,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,128H48V96H208V208Z"></path></svg> Activar`;
          }
        }
      }
    }

    // 2. Actualizar KPIs relevantes
    const [
      kpiTotal,
      kpiActivos,
      kpiBloqueados,
      kpiPorcentaje,
      kpiPorcentajeBloqueados
    ] = await Promise.all([
      fetch('/stats/usuarios-totales', { headers }).then(r => r.json()),
      fetch('/stats/usuarios-activos', { headers }).then(r => r.json()),
      fetch('/stats/usuarios-bloqueados', { headers }).then(r => r.json()),
      fetch('/stats/usuarios-activos-porcentaje', { headers }).then(r => r.json()),
      fetch('/stats/usuarios-bloqueados-porcentaje', { headers }).then(r => r.json())
    ]);

    // Actualizar KPIs en la interfaz
    document.getElementById("totalUsuarios").textContent = kpiTotal?.total ?? 0;
    document.getElementById("usuariosActivos").textContent = kpiActivos?.total ?? 0;
    document.getElementById("usuariosBloqueados").textContent = kpiBloqueados?.total ?? 0;
    document.getElementById("porcentajeUsuariosActivos").textContent = `${kpiPorcentaje?.porcentaje ?? 0}% del total`;
    document.getElementById("porcentajeUsuariosBloqueados").textContent = `${kpiPorcentajeBloqueados?.porcentaje ?? 0}% del total`;

    console.log('✅ Datos actualizados correctamente');

  } catch (error) {
    console.error('❌ Error al actualizar datos:', error);
    // Si falla la actualización parcial, recargar todo
    cargarUsuariosTemplate();
  }
}

// Mostrar pop-up de bloquear/desbloquear
async function cargarPopupBloquear(idUsuario, estaBloqueado = false) {
  const response = await fetch('/components/pop-up-bloquear-usuario.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  document.getElementById('pop-up-bloquear').style.display = 'flex';

  // Botón cancelar
  const popup = document.getElementById('pop-up-bloquear');
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

  // Botón Bloquear/Activar
  const btnBloquear = popup.querySelector('#confirmar-bloquear');
  if (btnBloquear) {
    btnBloquear.textContent = estaBloqueado ? 'Activar' : 'Bloquear';
    btnBloquear.className = estaBloqueado ? 'btn-verde' : 'btn-rojo';
    btnBloquear.onclick = async function() {
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
        return;
      }
      try {
        const resp = await fetch('https://www.procly.net/stats/bloquear-usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_id: idUsuario, bloqueado: !estaBloqueado })
        });
        
        if (!resp.ok) {
          throw new Error(`Error del servidor: ${resp.status} ${resp.statusText}`);
        }
        
        const result = await resp.json();
        if (!result.success) throw new Error(result.error || 'Error desconocido');
        
        popup.style.display = 'none';
        document.getElementById('popup-direccion-container').style.display = 'none';
        // Actualizar datos del usuario
        await actualizarDatosUsuario(idUsuario, null, !estaBloqueado);
        
      } catch (error) {
        alert('Error al actualizar usuario: ' + error.message);
      }
    };
  }
}

// Pop-up para activar usuario
async function cargarPopupActivar(idUsuario) {
  const response = await fetch('/components/pop-up-activar-usuario.html');
  const html = await response.text();
  document.getElementById('popup-direccion-container').innerHTML = html;
  document.getElementById('popup-direccion-container').style.display = 'block';
  const popup = document.getElementById('pop-up-activar');
  popup.style.display = 'flex';

  // Botón cancelar
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
  // Botón activar
  const btnActivar = document.getElementById('confirmar-activar');
  if (btnActivar) {
    btnActivar.onclick = async function() {
      try {
        const token = localStorage.getItem('supabaseToken');
        if (!token) {
          alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
          return;
        }
        const resp = await fetch('https://www.procly.net/stats/bloquear-usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_id: idUsuario, bloqueado: false })
        });
        if (!resp.ok) throw new Error('No se pudo activar el usuario');
        popup.style.display = 'none';
        document.getElementById('popup-direccion-container').style.display = 'none';
        // Actualizar datos del usuario
        await actualizarDatosUsuario(idUsuario, null, true);
      } catch (error) {
        alert('Error al activar el usuario: ' + error.message);
      }
    };
  }
}

// Función para actualizar el saldo de un usuario específico
async function actualizarSaldoUsuario(profileId, filaUsuario) {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Obtener todos los usuarios con sus saldos del backend
    const response = await fetch('/stats/usuarios-gasto-total', { headers });
    if (!response.ok) {
      console.warn(`⚠️ Error HTTP ${response.status} al obtener saldos de usuarios`);
      return;
    }
    
    const data = await response.json();
    if (!data.usuarios || !Array.isArray(data.usuarios)) {
      console.warn('⚠️ Respuesta inválida del endpoint de usuarios');
      return;
    }
    
    // Buscar el usuario específico
    const usuario = data.usuarios.find(u => u.profile_id === profileId);
    if (!usuario) {
      console.warn(`⚠️ Usuario ${profileId} no encontrado en la respuesta`);
      return;
    }
    
    const saldo = usuario.saldo || 0;
    
    // Actualizar la columna de saldo (columna 4)
    const tdSaldo = filaUsuario.querySelector('td:nth-child(4)');
    if (tdSaldo) {
      tdSaldo.innerHTML = `${Number(saldo).toLocaleString('es-AR').replace(/,/g, '.')} ARS`;
    }
    
    console.log(`✅ Saldo actualizado para usuario ${profileId}: ${saldo} ARS`);
  } catch (error) {
    console.error(`❌ Error al actualizar saldo para usuario ${profileId}:`, error);
  }
}
