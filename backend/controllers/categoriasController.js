const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/categorias - Obtener todas las categorías (público)
async function obtenerCategorias(req, res) {
    try {
        console.log('🔄 Obteniendo categorías desde Supabase...');
        console.log('🔑 URL:', process.env.SUPABASE_URL);
        console.log('🔑 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'NO CONFIGURADA');
        
        const { data: categorias, error } = await supabase
            .from('categorias')
            .select('id, nombre, descripcion, imagen, icon')
            .order('nombre', { ascending: true });
        
        if (error) {
            console.error('❌ Error al obtener categorías desde Supabase:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener categorías desde la base de datos'
            });
        }
        
        console.log(`✅ Categorías obtenidas: ${categorias ? categorias.length : 0} registros`);
        if (categorias && categorias.length > 0) {
            console.log('📋 Primeras categorías:', categorias.slice(0, 3));
        }
        
        res.json({
            success: true,
            categorias: categorias || []
        });
        
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener categorías'
        });
    }
}

module.exports = {
    obtenerCategorias
};
