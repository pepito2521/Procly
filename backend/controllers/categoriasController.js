const { createClient } = require('@supabase/supabase-js');

// Crear cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET /api/categorias - Obtener todas las categorías (público)
async function obtenerCategorias(req, res) {
    try {
        console.log('🔄 Obteniendo categorías desde Supabase...');
        
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
