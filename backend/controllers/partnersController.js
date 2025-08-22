const { supabaseService } = require('../config/supabase');
const multer = require('multer');
const path = require('path');

// Configurar multer para archivos
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, DOC, DOCX, PPT y PPTX.'), false);
        }
    }
});

// Registrar nuevo partner
const registrarPartner = async (req, res) => {
    try {
        console.log('Solicitud recibida en registrarPartner:', {
            body: req.body,
            file: req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : null,
            headers: req.headers,
            method: req.method,
            url: req.url
        });
        
        const {
            nombre_fantasia,
            razon_social,
            nombre_contacto,
            email,
            telefono,
            categoria,
            mensaje,
            certificaciones
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

        let brochureUrl = null;

        // Si hay un archivo, subirlo a Supabase Storage
        if (req.file) {
            try {
                const fileName = `${Date.now()}_${req.file.originalname}`;
                const filePath = `brochures/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabaseService.storage
                    .from('partners')
                    .upload(filePath, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Error al subir archivo:', uploadError);
                    return res.status(500).json({
                        success: false,
                        error: 'Error al subir el archivo'
                    });
                }

                // Obtener la URL pública del archivo
                const { data: urlData } = supabaseService.storage
                    .from('partners')
                    .getPublicUrl(filePath);

                brochureUrl = urlData.publicUrl;
                console.log('Archivo subido exitosamente:', brochureUrl);

            } catch (fileError) {
                console.error('Error procesando archivo:', fileError);
                return res.status(500).json({
                    success: false,
                    error: 'Error al procesar el archivo'
                });
            }
        }

        // Procesar certificaciones si existen
        let certificacionesArray = null;
        if (certificaciones) {
            try {
                certificacionesArray = JSON.parse(certificaciones);
            } catch (e) {
                console.log('Error parsing certificaciones, using as string:', e);
                certificacionesArray = [certificaciones];
            }
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
                    certificaciones: certificacionesArray,
                    brochure_url: brochureUrl,
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
    actualizarEstadoPartner,
    uploadBrochure: upload.single('brochure') // Middleware para manejar archivos
};
