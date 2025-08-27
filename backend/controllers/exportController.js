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
        
        // Obtener todos los tickets con información relacionada
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select(`
                id,
                codigo,
                nombre,
                descripcion,
                estado,
                precio_seleccionado,
                created_at,
                updated_at,
                profiles!inner(
                    nombre,
                    email
                ),
                empresas!inner(
                    razon_social
                )
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
        
        // Preparar datos para Excel
        const excelData = tickets.map(ticket => ({
            'Código': ticket.codigo || 'N/A',
            'Nombre': ticket.nombre || 'N/A',
            'Descripción': ticket.descripcion || 'N/A',
            'Usuario': ticket.profiles?.nombre || 'N/A',
            'Email Usuario': ticket.profiles?.email || 'N/A',
            'Empresa': ticket.empresas?.razon_social || 'N/A',
            'Estado': ticket.estado || 'N/A',
            'Precio': ticket.precio_seleccionado ? `${ticket.precio_seleccionado} ARS` : 'En proceso',
            'Fecha Creación': new Date(ticket.created_at).toLocaleString('es-AR'),
            'Última Actualización': new Date(ticket.updated_at).toLocaleString('es-AR')
        }));
        
        // Crear workbook y worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Ajustar ancho de columnas
        const columnWidths = [
            { wch: 15 }, // Código
            { wch: 30 }, // Nombre
            { wch: 40 }, // Descripción
            { wch: 25 }, // Usuario
            { wch: 30 }, // Email Usuario
            { wch: 30 }, // Empresa
            { wch: 15 }, // Estado
            { wch: 20 }, // Precio
            { wch: 20 }, // Fecha Creación
            { wch: 20 }  // Última Actualización
        ];
        worksheet['!cols'] = columnWidths;
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
        
        // Generar buffer del archivo
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
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
