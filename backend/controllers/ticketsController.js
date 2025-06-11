const { supabase } = require('../config/supabase');


// CREAR TICKET
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

    const user_id = req.user?.id || req.body.user_id;

    const { data: perfil, error: errorPerfil } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('profile_id', user_id)
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

// OBTENER DIRECCIONES SEGUN USUARIO
exports.obtenerDirecciones = async (req, res) => {
    try {
      const user_id = req.user?.id || req.query.user_id;

      console.log('🧪 [DEBUG] ID del usuario autenticado:', user_id);
  
      const { data: perfil, error: errorPerfil } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('profile_id', user_id)
        .single();
  
      if (errorPerfil) throw errorPerfil;
  
      const { data: direcciones, error } = await supabase
        .from('direcciones_entrega')
        .select('*')
        .eq('empresa_id', perfil.empresa_id);
  
      if (error) throw error;
  
      res.json(direcciones);
    } catch (err) {
      console.error('Error al obtener direcciones:', err.message);
      res.status(500).json({ error: 'No se pudieron cargar las direcciones', detalle: err.message });
    }
};

// OBTENER TICKETS DEL USUARIO AUTENTICADO
exports.obtenerTickets = async (req, res) => {
    try {
      const user_id = req.user?.id;
  
      if (!user_id) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
  
      const { data, error } = await supabase
        .from('tickets')
        .select('ticket_id, descripcion, estado')
        .eq('user_id', user_id);
  
      if (error) throw error;
  
      res.json(data);
    } catch (err) {
      console.error('Error al obtener tickets:', err.message);
      res.status(500).json({ error: 'No se pudieron obtener los tickets', detalle: err.message });
    }
};
  
