const { supabase } = require('../config/supabase');

// CREAR TICKET

function generarCodigoTicket() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = Math.floor(1000 + Math.random() * 9000);
  const letra = letras[Math.floor(Math.random() * letras.length)];
  return `TKT-${letra}${numeros}`;
}

const crearTicket = async (req, res) => {
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
const obtenerDirecciones = async (req, res) => {
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

// OBTENER TICKETS SEGUN USUARIO
const obtenerTickets = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { data, error } = await supabase
      .from('tickets')
      .select('ticket_id, codigo_ticket, nombre, estado')
      .eq('user_id', user_id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error al obtener tickets:', err.message);
    res.status(500).json({ error: 'No se pudieron obtener los tickets', detalle: err.message });
  }
};

// OBTENER TICKET SEGUN ID
const obtenerTicketPorId = async (req, res) => {
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

// SELECCIONAR PROPUESTA
const seleccionarPropuesta = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { propuesta_seleccionada } = req.body;
    const userId = req.user.id;
    if (!["A", "B", "C"].includes(propuesta_seleccionada)) {
      return res.status(400).json({ error: "Propuesta inválida. Debe ser A, B o C." });
    }
    const { data: ticket, error: errorTicket } = await supabase
      .from('tickets')
      .select('ticket_id, user_id')
      .eq('ticket_id', ticketId)
      .single();
    if (errorTicket) throw errorTicket;
    if (!ticket || ticket.user_id !== userId) {
      return res.status(403).json({ error: "No tenés permiso para modificar este ticket" });
    }
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        propuesta_seleccionada,
        estado: "En camino"
      })
      .eq('ticket_id', ticketId);
    if (updateError) throw updateError;
    res.json({ message: "Propuesta seleccionada correctamente", nuevaEtapa: "En camino" });
  } catch (err) {
    console.error("Error al seleccionar propuesta:", err.message);
    res.status(500).json({ error: "No se pudo guardar la propuesta", detalle: err.message });
  }
};

// KPI: TICKETS TOTALES POR USUARIO
const kpiTotalTicketsUsuario = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) throw new Error("No se encontró el user_id en req.user");
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);
    if (error) throw error;
    res.json({ total: count });
  } catch (error) {
    console.error("Error en kpiTotalTicketsUsuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// KPI: TICKETS ENTREGADOS POR USUARIO
const kpiTicketsEntregadosUsuario = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('estado', 'Entregado');
    if (error) throw error;
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// KPI: TICKETS EN PROCESO POR USUARIO
const kpiTicketsEnProcesoUsuario = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .not('estado', 'in', '("Entregado","Cancelado")');
    if (error) throw error;
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// KPI: TICKETS CANCELADOS POR USUARIO
const kpiTicketsCanceladosUsuario = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('estado', 'Cancelado');
    if (error) throw error;
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crearTicket,
  obtenerDirecciones,
  obtenerTickets,
  obtenerTicketPorId,
  seleccionarPropuesta,
  kpiTotalTicketsUsuario,
  kpiTicketsEntregadosUsuario,
  kpiTicketsEnProcesoUsuario,
  kpiTicketsCanceladosUsuario
};
