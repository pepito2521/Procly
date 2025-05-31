// backend/controllers/ticketsController.js
const { supabase } = require('../config/supabase');

exports.crearTicket = async (req, res) => {
  try {
    const {
      categoria,
      descripcion,
      presupuesto,
      limite,
      direccion_id,
      fecha_entrega,
      archivo_url
    } = req.body;

    const user_id = req.user?.id || req.body.user_id; // según si tenés auth

    // Buscar la empresa_id del usuario (desde profiles)
    const { data: perfil, error: errorPerfil } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', user_id)
      .single();

    if (errorPerfil) throw errorPerfil;

    const { error } = await supabase.from('tickets').insert({
      user_id,
      empresa_id: perfil.empresa_id,
      categoria,
      descripcion,
      presupuesto: limite === true || limite === 'si' ? presupuesto : null,
      limite: limite === true || limite === 'si',
      direccion_id,
      fecha_entrega,
      archivo_url,
      estado: 'Creado'
    });

    if (error) throw error;

    res.status(201).json({ message: 'Ticket creado con éxito' });
  } catch (err) {
    console.error('Error al crear ticket:', err.message);
    res.status(500).json({ error: 'No se pudo crear el ticket', detalle: err.message });
  }
};
