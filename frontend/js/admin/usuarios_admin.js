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
            <button class="btn2">Límite</button>
            <button class="btn-eliminar">${u.bloqueado ? 'Activar' : 'Bloquear'}</button>
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
  }