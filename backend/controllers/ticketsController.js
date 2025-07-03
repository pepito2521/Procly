const { supabase } = require('../config/supabase');

// CREAR TICKET

function generarCodigoTicket() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = Math.floor(1000 + Math.random() * 9000);
  const letra = letras[Math.floor(Math.random() * letras.length)];
  return `TKT-${letra}${numeros}`;
}

exports.crearTicket = async (req, res) => {
  try {
    const {
      categoria,
      nombre,
      descripcion,
      presupuesto,
      limite,
      direccion_id,
      fecha_entrega,
      archivo_url
    } = req.body;

    const user_id = req.user?.id || req.body.user_id;
    const codigo_ticket = generarCodigoTicket();
    const { data: perfil, error: errorPerfil } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('profile_id', user_id)
      .maybeSingle();

    if (errorPerfil) throw errorPerfil;
    if (!perfil) {
      return res.status(404).json({ error: 'Perfil de usuario no encontrado' });
    }

    const { error } = await supabase.from('tickets').insert({
      user_id,
      empresa_id: perfil.empresa_id,
      categoria,
      nombre,
      descripcion,
      presupuesto: limite === true || limite === 'si' ? presupuesto : null,
      limite: limite === true || limite === 'si',
      direccion_id,
      fecha_entrega,
      archivo_url,
      estado: 'Creado',
      codigo_ticket
    });

    if (error) throw error;
    
    res.status(201).json({ message: 'Ticket creado con éxito', codigo_ticket });

  } catch (err) {
    console.error('Error al crear ticket:', err.message);
    res.status(500).json({ error: 'No se pudo crear el ticket', detalle: err.message });
  }
  

};

// OBTENER DIRECCIONES SEGUN USUARIO
exports.obtenerDirecciones = async (req, res) => {
    try {
      const user_id = req.user?.id || req.query.user_id;
  
      const { data: perfil, error: errorPerfil } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('profile_id', user_id)
        .maybeSingle();
  
      if (errorPerfil) throw errorPerfil;
      if (!perfil) {
        return res.status(404).json({ error: 'Perfil de usuario no encontrado' });
      }
  
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

        const { data, error } = await supabase
          .from('tickets')
          .select('ticket_id, codigo_ticket, nombre, estado');

        if (error) throw error;
    
        res.json(data);
      } catch (err) {
        console.error('Error al obtener tickets:', err.message);
        res.status(500).json({ error: 'No se pudieron obtener los tickets', detalle: err.message });
      }
    };


  // OBTENER TICKET POR ID
exports.obtenerTicketPorId = async (req, res) => {
try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_id', ticketId)
    .eq('user_id', userId)
    .single();

    if (error) throw error;

    res.json(ticket);
} catch (err) {
    console.error("Error al obtener el ticket:", err.message);
    res.status(500).json({ error: 'No se pudo obtener el ticket', detalle: err.message });
}
};