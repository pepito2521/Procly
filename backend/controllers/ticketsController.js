const { supabase } = require('../config/supabase');
const { manejarEmailTicketCreado, enviarEmailCambioEstado } = require('./emailController');

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
    
    // Obtener perfil del usuario (incluyendo email para emails)
    const { data: perfil, error: errorPerfil } = await supabase
      .from('profiles')
      .select('empresa_id, email, nombre, apellido')
      .eq('profile_id', user_id)
      .maybeSingle();

    if (errorPerfil) throw errorPerfil;
    if (!perfil) {
      return res.status(404).json({ error: 'Perfil de usuario no encontrado' });
    }

    // Crear el ticket
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

    // Preparar datos del ticket para el email
    const ticketData = {
      codigo_ticket,
      categoria,
      descripcion,
      presupuesto: limite === true || limite === 'si' ? presupuesto : null,
      fecha_entrega,
      nombre: perfil.nombre,
      apellido: perfil.apellido
    };

    // Enviar emails usando el emailController (en segundo plano)
    manejarEmailTicketCreado(ticketData, perfil.email)
      .then(results => {
        console.log('📧 Resultados de emails:', {
          emailUsuario: results.emailUsuario.success ? '✅ Enviado' : '❌ Falló',
          emailAdmin: results.emailAdmin.skipped ? '⏭️ Saltado' : 
                     results.emailAdmin.success ? '✅ Enviado' : '❌ Falló'
        });
      })
      .catch(error => {
        console.error('❌ Error general en emails:', error);
      });

    res.status(201).json({ message: 'Ticket creado con éxito', codigo_ticket });

  } catch (err) {
    console.error('Error al crear ticket:', err.message);
    res.status(500).json({ error: 'No se pudo crear el ticket', detalle: err.message });
  }
};

// ACTUALIZAR ESTADO DE TICKET (para el panel de admin)
const actualizarEstadoTicket = async (req, res) => {
  try {
    const { ticket_id, nuevo_estado, comentario } = req.body;

    // Obtener el ticket actual
    const { data: ticket, error: errorTicket } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticket_id)
      .single();

    if (errorTicket) throw errorTicket;
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const estadoAnterior = ticket.estado;

    // Actualizar el estado del ticket
    const { error: errorUpdate } = await supabase
      .from('tickets')
      .update({ 
        estado: nuevo_estado,
        comentario_admin: comentario || null,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('ticket_id', ticket_id);

    if (errorUpdate) throw errorUpdate;

    // Enviar email de cambio de estado usando el emailController (en segundo plano)
    enviarEmailCambioEstado(ticket_id, nuevo_estado, comentario)
      .then(result => {
        if (result.success) {
          console.log('✅ Email de cambio de estado enviado correctamente');
        } else {
          console.error('❌ Error enviando email de cambio de estado:', result.error);
        }
      })
      .catch(error => {
        console.error('❌ Error general en email de cambio de estado:', error);
      });

    res.json({ 
      message: 'Estado del ticket actualizado con éxito',
      ticket_id,
      estado_anterior: estadoAnterior,
      nuevo_estado
    });

  } catch (err) {
    console.error('Error al actualizar estado del ticket:', err.message);
    res.status(500).json({ error: 'No se pudo actualizar el estado del ticket', detalle: err.message });
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

// KPI: GASTO TOTAL DEL USUARIO (suma de precio_seleccionado)
const kpiGastoTotalUsuario = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { data, error } = await supabase
      .from('tickets')
      .select('precio_seleccionado')
      .eq('user_id', user_id);
    
    if (error) throw error;
    
    const total = data.reduce((acc, ticket) => acc + (ticket.precio_seleccionado || 0), 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// KPI: LÍMITE DE GASTO DEL USUARIO (limite_gasto del perfil)
const kpiLimiteGastoUsuario = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('limite_gasto')
      .eq('profile_id', user_id)
      .single();
    
    if (error) throw error;
    
    const limite = perfil?.limite_gasto || 0;
    res.json({ total: limite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// KPI: SALDO DISPONIBLE DEL USUARIO (limite_gasto - gasto_total)
const kpiSaldoDisponibleUsuario = async (req, res) => {
  try {
    const user_id = req.user?.id;
    
    // Obtener límite del perfil
    const { data: perfil, error: errorPerfil } = await supabase
      .from('profiles')
      .select('limite_gasto')
      .eq('profile_id', user_id)
      .single();
    
    if (errorPerfil) throw errorPerfil;
    
    // Obtener gasto total
    const { data: tickets, error: errorTickets } = await supabase
      .from('tickets')
      .select('precio_seleccionado')
      .eq('user_id', user_id);
    
    if (errorTickets) throw errorTickets;
    
    const gastoTotal = tickets.reduce((acc, ticket) => acc + (ticket.precio_seleccionado || 0), 0);
    const limite = perfil?.limite_gasto || 0;
    const saldo = limite - gastoTotal;
    
    res.json({ total: saldo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crearTicket,
  actualizarEstadoTicket,
  obtenerDirecciones,
  obtenerTickets,
  obtenerTicketPorId,
  seleccionarPropuesta,
  kpiTotalTicketsUsuario,
  kpiTicketsEntregadosUsuario,
  kpiTicketsEnProcesoUsuario,
  kpiTicketsCanceladosUsuario,
  kpiGastoTotalUsuario,
  kpiLimiteGastoUsuario,
  kpiSaldoDisponibleUsuario
};
