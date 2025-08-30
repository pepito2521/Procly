const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Función para obtener empresa_id del usuario
async function obtenerEmpresaId(userId) {
  try {
    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('profile_id', userId)
      .single();

    if (error || !perfil?.empresa_id) {
      throw new Error('No se pudo obtener empresa_id del usuario');
    }

    return perfil.empresa_id;
  } catch (error) {
    console.error('❌ Error al obtener empresa_id:', error);
    throw error;
  }
}

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

// PUT /api/categorias/:id/estado - Actualizar estado de categoría
async function actualizarEstadoCategoria(req, res) {
    try {
        const { id } = req.params;
        const { habilitada } = req.body;
        const userId = req.user.id;

        console.log('🔄 Actualizando estado de categoría:', { id, habilitada, userId });

        // Validaciones
        if (typeof habilitada !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'El campo habilitada debe ser un booleano'
            });
        }

        // Obtener empresa_id del usuario
        const empresaId = await obtenerEmpresaId(userId);

        // Actualizar o insertar en empresa_categorias
        const { error: upsertError } = await supabase
            .from('empresa_categorias')
            .upsert({
                empresa_id: empresaId,
                categoria_id: parseInt(id),
                habilitada: habilitada,
                updated_at: new Date().toISOString()
            });

        if (upsertError) {
            console.error('❌ Error al actualizar empresa_categorias:', upsertError);
            return res.status(500).json({
                success: false,
                error: 'Error al actualizar el estado de la categoría'
            });
        }

        console.log('✅ Estado de categoría actualizado correctamente');
        res.json({
            success: true,
            message: 'Estado de categoría actualizado correctamente',
            data: {
                categoria_id: parseInt(id),
                habilitada: habilitada,
                empresa_id: empresaId
            }
        });

    } catch (error) {
        console.error('❌ Error al actualizar estado de categoría:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor al actualizar categoría'
        });
    }
}

module.exports = {
    obtenerCategorias,
    actualizarEstadoCategoria
};
