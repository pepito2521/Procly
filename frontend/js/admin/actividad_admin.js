// ACTIVIDAD ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initActividad() {
  cargarActividadTemplate();
}

async function cargarActividadTemplate() {
    let tbody;

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
            kpiEntregados,
            kpiEnProceso,
            kpiCancelados,
            listadoTickets,
            kpiPorcentajeEntregados,
            kpiPorcentajeEnProceso,
            kpiPorcentajeCancelados
        ] = await Promise.all([
            fetchWithErrorHandling('/stats/tickets-totales', headers),
            fetchWithErrorHandling('/stats/tickets-entregados', headers),
            fetchWithErrorHandling('/stats/tickets-en-proceso', headers),
            fetchWithErrorHandling('/stats/tickets-cancelados', headers),
            fetchWithErrorHandling('/stats/actividad-tickets', headers),
            fetchWithErrorHandling('/stats/tickets-entregados-porcentaje', headers),
            fetchWithErrorHandling('/stats/tickets-en-proceso-porcentaje', headers),
            fetchWithErrorHandling('/stats/tickets-cancelados-porcentaje', headers)
        ]);

        // Logs para depuración
        console.log({kpiTotal, kpiEntregados, kpiEnProceso, kpiCancelados, listadoTickets, kpiPorcentajeEntregados, kpiPorcentajeEnProceso, kpiPorcentajeCancelados});

        // Actualizar las tarjetas de resumen con los IDs correctos
        document.getElementById("actividadTotales").textContent = kpiTotal?.total ?? 0;
        document.getElementById("actividadEntregados").textContent = kpiEntregados?.total ?? 0;
        document.getElementById("actividadEnProceso").textContent = kpiEnProceso?.total ?? 0;
        document.getElementById("actividadCancelados").textContent = kpiCancelados?.total ?? 0;
        
        // Actualizar los subtítulos con porcentajes
        document.getElementById("actividadTotalesSub").textContent = `Total de tickets de la empresa`;
        document.getElementById("actividadEntregadosSub").textContent = `${kpiPorcentajeEntregados?.porcentaje ?? 0}% del total`;
        document.getElementById("actividadEnProcesoSub").textContent = `${kpiPorcentajeEnProceso?.porcentaje ?? 0}% del total`;
        document.getElementById("actividadCanceladosSub").textContent = `${kpiPorcentajeCancelados?.porcentaje ?? 0}% del total`;

        // 2. Tabla
        tbody = document.getElementById("tablaActividad");
        tbody.innerHTML = "";

        if (!listadoTickets || !listadoTickets.tickets || listadoTickets.tickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">⚠️ No hay tickets disponibles</td></tr>`;
            return;
        }

        cargarTablaHistorial(listadoTickets.tickets);

    } catch (error) {
        console.error("Error al cargar actividad:", error);
        const tbodyError = document.getElementById("tablaActividad");
        if (tbodyError) {
            tbodyError.innerHTML = `<tr><td colspan="5">❌ Error al cargar actividad</td></tr>`;
        }
        return;
    }

    // BUSCADOR DE TICKETS
    const inputBuscador = document.getElementById("buscadorTickets");
    inputBuscador?.addEventListener("input", (e) => {
        const valor = e.target.value.toLowerCase();
        const filas = tbody.querySelectorAll("tr");
        filas.forEach((fila) => {
            const textoCodigo = fila.children[0]?.textContent.toLowerCase() ?? "";
            const textoNombre = fila.children[1]?.textContent.toLowerCase() ?? "";
            fila.style.display = (textoCodigo.includes(valor) || textoNombre.includes(valor)) ? "" : "none";
        });
    });
}

function cargarTablaHistorial(tickets) {
    const tbody = document.getElementById("tablaActividad");
    tbody.innerHTML = "";

    tickets.forEach(ticket => {
        const row = document.createElement("tr");
        const nombreTicket = ticket.nombre_ticket || ticket.nombre || 'Sin nombre';
        const nombreUsuario = ticket.nombre || 'Sin nombre';
        const apellidoUsuario = ticket.apellido || '';
        let precio;
        let precioClass = '';

        if (ticket.precio && ticket.precio !== 'En proceso') {
            precio = ticket.precio;
        } else {
            precio = 'En proceso';
            precioClass = 'precio-en-proceso';
        }
        const estadoClass = `estado-badge ${ticket.estado?.toLowerCase().replace(' ', '-') || 'creado'}`;
        
        row.innerHTML = `
            <td>${ticket.codigo_ticket || 'N/A'}</td>
            <td>${nombreTicket}</td>
            <td>${nombreUsuario} ${apellidoUsuario}</td>
            <td>
                <span class="${estadoClass}">
                    ${ticket.estado || 'Creado'}
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
            alert('No se encontró el token de autorización. Por favor, vuelve a iniciar sesión.');
            return;
        }

        // Mostrar popup para seleccionar nuevo estado
        const nuevoEstado = prompt('Selecciona el nuevo estado:\n\n1. Creado\n2. En Proceso\n3. Propuestas\n4. En Camino\n5. Entregado\n6. Revisar\n7. Cancelado\n\nIngresa el número (1-7):');
        
        if (!nuevoEstado) return;

        const estados = [
            'Creado',
            'En Proceso', 
            'Propuestas',
            'En Camino',
            'Entregado',
            'Revisar',
            'Cancelado'
        ];

        const estadoSeleccionado = estados[parseInt(nuevoEstado) - 1];
        
        if (!estadoSeleccionado) {
            alert('Estado inválido. Por favor, selecciona un número del 1 al 7.');
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
            alert(`✅ Estado actualizado exitosamente a: ${estadoSeleccionado}`);
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

