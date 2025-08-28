const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Crear cliente de Supabase con clave de servicio
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/export/tickets - Exportar tickets a Excel
async function exportarTickets(req, res) {
    try {
        console.log('🔄 Exportando tickets a Excel...');
        console.log('🔑 Headers recibidos:', req.headers);
        console.log('🌐 SUPABASE_URL:', process.env.SUPABASE_URL ? 'Configurado' : 'NO CONFIGURADO');
        console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'NO CONFIGURADO');
        
        // Obtener todos los tickets con información relacionada
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select(`
                ticket_id,
                codigo_ticket,
                nombre,
                descripcion,
                estado,
                precio_seleccionado,
                created_at,
                fecha_actualizacion,
                user_id,
                empresa_id
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error al obtener tickets desde Supabase:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener tickets desde la base de datos'
            });
        }
        
        if (!tickets || tickets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No se encontraron tickets para exportar'
            });
        }
        
        console.log(`✅ ${tickets.length} tickets obtenidos para exportar`);
        console.log('📊 Muestra del primer ticket:', tickets[0]);
        
        // Validar que los datos sean válidos
        if (!Array.isArray(tickets)) {
            throw new Error('Los tickets no son un array válido');
        }
        
        // Preparar datos para Excel
        const excelData = tickets.map(ticket => ({
            'ID': ticket.ticket_id || 'N/A',
            'Código': ticket.codigo_ticket || 'N/A',
            'Nombre': ticket.nombre || 'N/A',
            'Descripción': ticket.descripcion || 'N/A',
            'Estado': ticket.estado || 'N/A',
            'Precio': ticket.precio_seleccionado ? `${Number(ticket.precio_seleccionado).toLocaleString('es-AR')} ARS` : 'En proceso',
            'Fecha Creación': ticket.created_at ? new Date(ticket.created_at).toLocaleString('es-AR') : 'N/A',
            'Última Actualización': ticket.fecha_actualizacion ? new Date(ticket.fecha_actualizacion).toLocaleString('es-AR') : 'N/A'
        }));
        
        // Crear workbook y worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Ajustar ancho de columnas
        const columnWidths = [
            { wch: 10 }, // ID
            { wch: 15 }, // Código
            { wch: 30 }, // Nombre
            { wch: 40 }, // Descripción
            { wch: 15 }, // Estado
            { wch: 20 }, // Precio
            { wch: 20 }, // Fecha Creación
            { wch: 20 }  // Última Actualización
        ];
        worksheet['!cols'] = columnWidths;
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
        
        console.log('📋 Excel data preparado:', excelData.slice(0, 2)); // Mostrar primeros 2 registros
        
        // Generar buffer del archivo
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        // Validar que el buffer se generó correctamente
        if (!excelBuffer || excelBuffer.length === 0) {
            throw new Error('El buffer del archivo Excel está vacío');
        }
        
        console.log(`📁 Buffer generado: ${excelBuffer.length} bytes`);
        
        // Configurar headers para descarga
        const fileName = `tickets_procly_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Enviar archivo
        res.send(excelBuffer);
        
        console.log(`✅ Archivo Excel generado: ${fileName}`);
        
    } catch (error) {
        console.error('❌ Error al exportar tickets:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al exportar tickets'
        });
    }
}

module.exports = {
    exportarTickets
};
