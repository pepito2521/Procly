const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// GET /api/categorias - Obtener todas las categorías (público)
async function obtenerCategorias(req, res) {
    try {
        console.log('🔄 Obteniendo categorías desde la base de datos...');
        
        const query = `
            SELECT id, nombre, descripcion, imagen, icon
            FROM categorias
            ORDER BY nombre ASC
        `;
        
        const result = await pool.query(query);
        
        console.log(`✅ Categorías obtenidas: ${result.rows.length} registros`);
        
        res.json({
            success: true,
            categorias: result.rows
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
