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

        document.getElementById("totalTickets").textContent = kpiTotal?.total ?? 0;
        document.getElementById("ticketsEntregados").textContent = kpiEntregados?.total ?? 0;
        document.getElementById("ticketsEnProceso").textContent = kpiEnProceso?.total ?? 0;
        document.getElementById("ticketsCancelados").textContent = kpiCancelados?.total ?? 0;
        document.getElementById("porcentajeEntregados").textContent = `${kpiPorcentajeEntregados?.porcentaje ?? 0}% del total`;
        document.getElementById("porcentajeEnProceso").textContent = `${kpiPorcentajeEnProceso?.porcentaje ?? 0}% del total`;
        document.getElementById("porcentajeCancelados").textContent = `${kpiPorcentajeCancelados?.porcentaje ?? 0}% del total`;

        // 2. Tabla
        tbody = document.getElementById("tablaActividad");
        tbody.innerHTML = "";

        if (!listadoTickets || !listadoTickets.tickets || listadoTickets.tickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">⚠️ No hay tickets disponibles</td></tr>`;
            return;
        }

        cargarTablaHistorial(listadoTickets.tickets);

    } catch (error) {
        console.error("Error al cargar actividad:", error);
        const tbodyError = document.getElementById("tablaActividad");
        if (tbodyError) {
            tbodyError.innerHTML = `<tr><td colspan="6">❌ Error al cargar actividad</td></tr>`;
        }
        return;
    }

    // BUSCADOR DE TICKETS
    const inputBuscador = document.getElementById("buscadorActividad");
    inputBuscador?.addEventListener("input", (e) => {
        const valor = e.target.value.toLowerCase();
        const filas = tbody.querySelectorAll("tr");
        filas.forEach((fila) => {
            const textoNombre = fila.children[0]?.textContent.toLowerCase() ?? "";
            const textoDescripcion = fila.children[1]?.textContent.toLowerCase() ?? "";
            fila.style.display = (textoNombre.includes(valor) || textoDescripcion.includes(valor)) ? "" : "none";
        });
    });
}

function cargarTablaHistorial(tickets) {
    const tbody = document.getElementById("tablaActividad");
    tbody.innerHTML = "";

    tickets.forEach(ticket => {
        const row = document.createElement("tr");
        
        // Mapear datos correctamente
        const nombreTicket = ticket.nombre_ticket || ticket.nombre || 'Sin nombre';
        const nombreUsuario = ticket.nombre || 'Sin nombre';
        const apellidoUsuario = ticket.apellido || '';
        const precio = ticket.precio_seleccionado || ticket.presupuesto || 'En proceso';
        
        // Aplicar clase especial para precios "En proceso"
        const precioClass = precio === 'En proceso' ? 'precio-en-proceso' : '';
        
        // Aplicar badge class correctamente
        const estadoClass = `estado-badge ${ticket.estado?.toLowerCase().replace(' ', '-') || 'creado'}`;
        
        row.innerHTML = `
            <td>${nombreTicket}</td>
            <td>${nombreUsuario} ${apellidoUsuario}</td>
            <td class="${precioClass}">$${precio}</td>
            <td>
                <span class="${estadoClass}">
                    ${ticket.estado || 'Creado'}
                </span>
            </td>
            <td>
                <div class="acciones-btns">
                    <button class="btn-editar" onclick="editarTicket(${ticket.ticket_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#1976d2" viewBox="0 0 256 256">
                            <path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z"></path>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-eliminar" onclick="cambiarEstadoTicket(${ticket.ticket_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#d32f2f" viewBox="0 0 256 256">
                            <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path>
                        </svg>
                        Estado
                    </button>
                </div>
            </td>
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

