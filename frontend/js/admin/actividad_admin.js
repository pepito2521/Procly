// REGISTRO DE ACTIVIDAD ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initActividad() {
  cargarActividadTemplate();
}

async function cargarActividadTemplate() {
  let tbody;

  try {
    // 1. KPIs y listado
    const [
      kpiTotal, kpiEntregados, kpiEnProceso, kpiCancelados, listadoTickets, kpiPorcentajeEntregados, kpiPorcentajeEnProceso, kpiPorcentajeCancelados
    ] = await Promise.all([
      fetch('/stats/tickets-totales'),
      fetch('/stats/tickets-entregados'),
      fetch('/stats/tickets-en-proceso'),
      fetch('/stats/tickets-cancelados'),
      fetch('/stats/actividad-tickets'),
      fetch('/stats/tickets-entregados-porcentaje'),
      fetch('/stats/tickets-en-proceso-porcentaje'),
      fetch('/stats/tickets-cancelados-porcentaje')
    ]);

    if (!kpiTotal.ok || !kpiEntregados.ok || !kpiEnProceso.ok || !kpiCancelados.ok || !listadoTickets.ok) {
      throw new Error('Error al obtener datos del backend');
    }

    const total = await kpiTotal.json();
    const entregados = await kpiEntregados.json();
    const enProceso = await kpiEnProceso.json();
    const cancelados = await kpiCancelados.json();
    const tickets = await listadoTickets.json();

    // Actualizar las tarjetas de resumen con los IDs correctos
    document.getElementById("actividadTotales").textContent = total.total ?? 0;
    document.getElementById("actividadEntregados").textContent = entregados.total ?? 0;
    document.getElementById("actividadEnProceso").textContent = enProceso.total ?? 0;
    document.getElementById("actividadCancelados").textContent = cancelados.total ?? 0;

    // Actualizar los subtítulos con porcentajes
    document.getElementById("actividadTotalesSub").textContent = `Total de tickets de la empresa`;
    document.getElementById("actividadEntregadosSub").textContent = `${kpiPorcentajeEntregados?.porcentaje ?? 0}% del total`;
    document.getElementById("actividadEnProcesoSub").textContent = `${kpiPorcentajeEnProceso?.porcentaje ?? 0}% del total`;
    document.getElementById("actividadCanceladosSub").textContent = `${kpiPorcentajeCancelados?.porcentaje ?? 0}% del total`;

    // 2. Tabla
    tbody = document.getElementById("tablaActividad");
    tbody.innerHTML = "";

    if (!tickets || !tickets.tickets || tickets.tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">▲ No hay tickets disponibles</td></tr>`;
      return;
    }
    cargarTablaHistorial(tickets.tickets);

  } catch (error) {
    console.error("Error al cargar actividad:", error);
    const tbodyError = document.getElementById("tablaActividad");
    if (tbodyError) {
      tbodyError.innerHTML = `<tr><td colspan="5">❌ Error al cargar actividad</td></tr>`;
    }
    return;
  }

  // Función para cargar la tabla de historial
  function cargarTablaHistorial(tickets) {
    const tbody = document.getElementById("tablaActividad");
    tbody.innerHTML = "";

    tickets.forEach((ticket) => {
      let precio = ticket.precio;
      let precioClass = 'precio-valor';

      if (!precio || precio === 'En proceso') {
        precio = 'En proceso';
        precioClass = 'precio-en-proceso';
      }

      const estadoClass = `estado-badge ${ticket.estado?.toLowerCase().replace(' ', '-') || 'creado'}`;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ticket.codigo_ticket}</td>
        <td>${ticket.nombre_ticket}</td>
        <td>${ticket.nombre} ${ticket.apellido}</td>
        <td>
          <span class="${estadoClass}">
            ${ticket.estado}
          </span>
        </td>
        <td class="${precioClass}">${precio}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // Función para cambiar el estado de un ticket
  async function cambiarEstadoTicket(ticketId) {
    try {
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        alert('❌ No se encontró el token de autenticación.');
        return;
      }

      // Mostrar popup para seleccionar nuevo estado
      const nuevoEstado = prompt('Selecciona el nuevo estado:\n\n1. Creado\n2. En Proceso\n3. Propuestas\n4. En Camino\n5. Entregado\n6. Revisar\n7. Cancelado');
      if (!nuevoEstado) return;

      const estados = ['Creado', 'En Proceso', 'Propuestas', 'En Camino', 'Entregado', 'Revisar', 'Cancelado'];
      const estadoSeleccionado = estados[parseInt(nuevoEstado) - 1];

      if (!estadoSeleccionado) {
        alert('❌ Estado inválido');
        return;
      }

      const comentario = prompt('Comentario opcional para el usuario:');

      const response = await fetch('/tickets/estado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          nuevo_estado: estadoSeleccionado,
          comentario: comentario || null
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert(`✔ Estado actualizado exitosamente a: ${estadoSeleccionado}`);
        // Recargar la tabla
        cargarActividadTemplate();
      } else {
        alert(`❌ Error al actualizar estado: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error cambiando estado del ticket:', error);
      alert('❌ Error al cambiar el estado del ticket');
    }
  }

  // Función para editar ticket (placeholder)
  function editarTicket(ticketId) {
    alert(`Editar ticket ${ticketId} - Función en desarrollo`);
  }

  // Exponer funciones globalmente
  window.cambiarEstadoTicket = cambiarEstadoTicket;
  window.editarTicket = editarTicket;
}

