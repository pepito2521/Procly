const { supabaseService } = require('../config/supabase');

// Registrar nuevo partner
const registrarPartner = async (req, res) => {
    try {
        const {
            nombre_fantasia,
            razon_social,
            nombre_contacto,
            email,
            telefono,
            categoria,
            mensaje
        } = req.body;

        // Validaciones básicas
        if (!nombre_fantasia || !razon_social || !nombre_contacto || !email || !categoria) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos obligatorios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de email inválido'
            });
        }

        // Insertar en la base de datos
        const { data, error } = await supabaseService
            .from('partners')
            .insert([
                {
                    nombre_fantasia,
                    razon_social,
                    nombre_contacto,
                    email,
                    telefono: telefono || null,
                    categoria,
                    mensaje: mensaje || null,
                    estado: 'pendiente',
                    fecha_registro: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Error al insertar partner:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor al registrar el partner'
            });
        }

        console.log('Partner registrado exitosamente:', data[0]);

        res.status(201).json({
            success: true,
            message: 'Partner registrado exitosamente',
            data: data[0]
        });

    } catch (error) {
        console.error('Error en registrarPartner:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Obtener todos los partners (para admin)
const obtenerPartners = async (req, res) => {
    try {
        const { data, error } = await supabaseService
            .from('partners')
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) {
            console.error('Error al obtener partners:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener partners'
            });
        }

        res.json({
            success: true,
            data: data || []
        });

    } catch (error) {
        console.error('Error en obtenerPartners:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Actualizar estado de partner (para admin)
const actualizarEstadoPartner = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado || !['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido'
            });
        }

        const { data, error } = await supabaseService
            .from('partners')
            .update({ estado })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error al actualizar partner:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al actualizar partner'
            });
        }

        res.json({
            success: true,
            message: 'Estado actualizado exitosamente',
            data: data[0]
        });

    } catch (error) {
        console.error('Error en actualizarEstadoPartner:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    registrarPartner,
    obtenerPartners,
    actualizarEstadoPartner
};
