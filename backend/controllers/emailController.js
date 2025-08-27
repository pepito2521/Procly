const { supabase } = require('../config/supabase');
const { 
  sendTicketCreatedEmail, 
  sendStatusChangeEmail, 
  sendAdminNotificationEmail 
} = require('../utils/emailService');

// Enviar email cuando se crea un ticket
const enviarEmailTicketCreado = async (ticketData, userEmail) => {
  try {
    await sendTicketCreatedEmail(userEmail, ticketData);
    console.log('✅ Email de ticket creado enviado a:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de ticket creado:', error);
    return { success: false, error: error.message };
  }
};

// Enviar email cuando cambia el estado de un ticket
const enviarEmailCambioEstado = async (ticketId, nuevoEstado, comentario = null) => {
  try {
    // Obtener datos del ticket
    const { data: ticket, error: errorTicket } = await supabase
      .from('tickets')
      .select('*, profiles(email, nombre, apellido)')
      .eq('ticket_id', ticketId)
      .single();

    if (errorTicket) throw errorTicket;
    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    const ticketData = {
      codigo_ticket: ticket.codigo_ticket,
      categoria: ticket.categoria,
      descripcion: ticket.descripcion,
      presupuesto: ticket.presupuesto,
      fecha_entrega: ticket.fecha_entrega
    };

    await sendStatusChangeEmail(
      ticket.profiles.email,
      ticketData,
      ticket.estado,
      nuevoEstado,
      comentario
    );

    console.log('✅ Email de cambio de estado enviado a:', ticket.profiles.email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de cambio de estado:', error);
    return { success: false, error: error.message };
  }
};

// Enviar notificación al admin cuando se crea un ticket
const enviarNotificacionAdmin = async (ticketData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // Solo enviar email al admin si está configurado
    if (!adminEmail) {
      console.log('📧 Email de admin no configurado - saltando notificación');
      return { success: true, skipped: true };
    }
    
    await sendAdminNotificationEmail(adminEmail, ticketData);
    console.log('✅ Email de notificación enviado al admin:', adminEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email al admin:', error);
    return { success: false, error: error.message };
  }
};

// Función principal para manejar emails de ticket creado
const manejarEmailTicketCreado = async (ticketData, userEmail) => {
  const results = await Promise.allSettled([
    enviarEmailTicketCreado(ticketData, userEmail),
    enviarNotificacionAdmin(ticketData)
  ]);

  return {
    emailUsuario: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: results[0].reason },
    emailAdmin: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: results[1].reason }
  };
};

// Función para probar el sistema de emails
const probarSistemaEmails = async (emailDestino) => {
  try {
    const testTicketData = {
      codigo_ticket: 'TKT-TEST123',
      categoria: 'Tecnología',
      descripcion: 'Ticket de prueba para verificar el sistema de emails',
      presupuesto: '50000',
      fecha_entrega: '2024-12-31',
      nombre: 'Usuario',
      apellido: 'Prueba'
    };

    const result = await sendTicketCreatedEmail(emailDestino, testTicketData);
    return { success: true, messageId: result?.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener estadísticas de emails enviados (placeholder para futuras implementaciones)
const obtenerEstadisticasEmails = async () => {
  // En el futuro, podrías guardar logs de emails en la base de datos
  return {
    emailsEnviados: 0,
    emailsFallidos: 0,
    ultimoEmail: null
  };
};

module.exports = {
  enviarEmailTicketCreado,
  enviarEmailCambioEstado,
  enviarNotificacionAdmin,
  manejarEmailTicketCreado,
  probarSistemaEmails,
  obtenerEstadisticasEmails
}; 