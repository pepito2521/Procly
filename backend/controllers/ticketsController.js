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

// OBTENER DIRECCIONES SEGUN USUARIO
exports.obtenerDirecciones = async (req, res) => {
    try {
      const user_id = req.user?.id || req.query.user_id;
  
      // Buscar empresa_id del usuario
      const { data: perfil, error: errorPerfil } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user_id)
        .single();
  
      if (errorPerfil) throw errorPerfil;
  
      // Traer direcciones asociadas a esa empresa
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
  
